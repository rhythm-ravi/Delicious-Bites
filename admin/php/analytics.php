<?php
require_once 'check_session.php';
header('Content-Type: application/json');

$response = [
    "success" => false,
    "error" => null
];

try {
    require_once '../../php/db.php';
    
    $action = $_GET['action'] ?? '';

    if ($action === 'summary') {
        // Key metrics
        
        // Total revenue (all completed payments)
        $stmt = $mysqli->prepare("SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE status = 'Completed'");
        $stmt->execute();
        $result = $stmt->get_result();
        $total_revenue = $result->fetch_assoc()['total_revenue'];
        $stmt->close();

        // Revenue today
        $stmt = $mysqli->prepare("SELECT COALESCE(SUM(p.amount), 0) as revenue_today FROM payments p JOIN orders o ON p.order_id = o.id WHERE p.status = 'Completed' AND DATE(o.order_time) = CURDATE()");
        $stmt->execute();
        $result = $stmt->get_result();
        $revenue_today = $result->fetch_assoc()['revenue_today'];
        $stmt->close();

        // Revenue this week
        $stmt = $mysqli->prepare("SELECT COALESCE(SUM(p.amount), 0) as revenue_week FROM payments p JOIN orders o ON p.order_id = o.id WHERE p.status = 'Completed' AND YEARWEEK(o.order_time, 1) = YEARWEEK(CURDATE(), 1)");
        $stmt->execute();
        $result = $stmt->get_result();
        $revenue_week = $result->fetch_assoc()['revenue_week'];
        $stmt->close();

        // Revenue this month
        $stmt = $mysqli->prepare("SELECT COALESCE(SUM(p.amount), 0) as revenue_month FROM payments p JOIN orders o ON p.order_id = o.id WHERE p.status = 'Completed' AND MONTH(o.order_time) = MONTH(CURDATE()) AND YEAR(o.order_time) = YEAR(CURDATE())");
        $stmt->execute();
        $result = $stmt->get_result();
        $revenue_month = $result->fetch_assoc()['revenue_month'];
        $stmt->close();

        // Total orders
        $stmt = $mysqli->prepare("SELECT COUNT(*) as total_orders FROM orders");
        $stmt->execute();
        $result = $stmt->get_result();
        $total_orders = $result->fetch_assoc()['total_orders'];
        $stmt->close();

        // Orders today
        $stmt = $mysqli->prepare("SELECT COUNT(*) as orders_today FROM orders WHERE DATE(order_time) = CURDATE()");
        $stmt->execute();
        $result = $stmt->get_result();
        $orders_today = $result->fetch_assoc()['orders_today'];
        $stmt->close();

        // Orders by status
        $stmt = $mysqli->prepare("SELECT status, COUNT(*) as count FROM orders GROUP BY status");
        $stmt->execute();
        $result = $stmt->get_result();
        $orders_by_status = [];
        while ($row = $result->fetch_assoc()) {
            $orders_by_status[$row['status']] = $row['count'];
        }
        $stmt->close();

        // Average order value
        $avg_order_value = $total_orders > 0 ? $total_revenue / $total_orders : 0;

        // Top selling items
        $stmt = $mysqli->prepare("
            SELECT i.name, SUM(oe.qty) as total_qty, SUM(oe.qty * oe.price) as total_revenue
            FROM ordered_entries oe
            JOIN items i ON oe.item_id = i.id
            GROUP BY oe.item_id
            ORDER BY total_qty DESC
            LIMIT 10
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $top_items = [];
        while ($row = $result->fetch_assoc()) {
            $top_items[] = $row;
        }
        $stmt->close();

        // Revenue by payment method
        $stmt = $mysqli->prepare("
            SELECT pm.method_name, COALESCE(SUM(p.amount), 0) as total_amount
            FROM payment_methods pm
            LEFT JOIN payments p ON pm.method_id = p.method_id AND p.status = 'Completed'
            GROUP BY pm.method_id
            ORDER BY total_amount DESC
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $revenue_by_method = [];
        while ($row = $result->fetch_assoc()) {
            if ($row['total_amount'] > 0) {
                $revenue_by_method[] = $row;
            }
        }
        $stmt->close();

        // Customer count
        $stmt = $mysqli->prepare("SELECT COUNT(*) as customer_count FROM customers");
        $stmt->execute();
        $result = $stmt->get_result();
        $customer_count = $result->fetch_assoc()['customer_count'];
        $stmt->close();

        $response = [
            "success" => true,
            "data" => [
                "total_revenue" => floatval($total_revenue),
                "revenue_today" => floatval($revenue_today),
                "revenue_week" => floatval($revenue_week),
                "revenue_month" => floatval($revenue_month),
                "total_orders" => intval($total_orders),
                "orders_today" => intval($orders_today),
                "orders_by_status" => $orders_by_status,
                "avg_order_value" => floatval($avg_order_value),
                "top_items" => $top_items,
                "revenue_by_method" => $revenue_by_method,
                "customer_count" => intval($customer_count)
            ]
        ];

    } elseif ($action === 'sales_chart') {
        $period = $_GET['period'] ?? 'week';
        
        $query = "";
        if ($period === 'week') {
            // Last 7 days
            $query = "
                SELECT DATE(o.order_time) as date, COALESCE(SUM(p.amount), 0) as revenue
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id AND p.status = 'Completed'
                WHERE o.order_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(o.order_time)
                ORDER BY date ASC
            ";
        } elseif ($period === 'month') {
            // Last 30 days
            $query = "
                SELECT DATE(o.order_time) as date, COALESCE(SUM(p.amount), 0) as revenue
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id AND p.status = 'Completed'
                WHERE o.order_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(o.order_time)
                ORDER BY date ASC
            ";
        } elseif ($period === 'year') {
            // Last 12 months
            $query = "
                SELECT DATE_FORMAT(o.order_time, '%Y-%m') as date, COALESCE(SUM(p.amount), 0) as revenue
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id AND p.status = 'Completed'
                WHERE o.order_time >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(o.order_time, '%Y-%m')
                ORDER BY date ASC
            ";
        }

        $stmt = $mysqli->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $sales_data = [];
        while ($row = $result->fetch_assoc()) {
            $sales_data[] = $row;
        }
        $stmt->close();

        $response = [
            "success" => true,
            "data" => $sales_data
        ];

    } elseif ($action === 'item_performance') {
        $stmt = $mysqli->prepare("
            SELECT i.id, i.name, i.price, SUM(oe.qty) as total_qty, SUM(oe.qty * oe.price) as total_revenue
            FROM items i
            LEFT JOIN ordered_entries oe ON i.id = oe.item_id
            WHERE i.is_deprecated = FALSE
            GROUP BY i.id
            ORDER BY total_qty DESC
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $item_performance = [];
        while ($row = $result->fetch_assoc()) {
            $item_performance[] = $row;
        }
        $stmt->close();

        $response = [
            "success" => true,
            "data" => $item_performance
        ];

    } else {
        throw new Exception("Invalid action specified.");
    }

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if (isset($mysqli) && $mysqli instanceof mysqli) {
        $mysqli->close();
    }
}

echo json_encode($response);
exit;
?>
