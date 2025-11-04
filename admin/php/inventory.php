<?php
require_once 'check_session.php';
header('Content-Type: application/json');

$response = [
    "success" => false,
    "error" => null
];

try {
    require_once '../../php/db.php';
    
    $action = $_GET['action'] ?? $_POST['action'] ?? '';

    if ($action === 'list') {
        $stmt = $mysqli->prepare("SELECT * FROM items ORDER BY id DESC");
        $stmt->execute();
        $result = $stmt->get_result();
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        $stmt->close();

        $response = [
            "success" => true,
            "data" => $items
        ];

    } elseif ($action === 'toggle_availability') {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            throw new Exception("Only POST requests are allowed.");
        }

        $item_id = $_POST['item_id'] ?? 0;

        if (empty($item_id)) {
            throw new Exception("Item ID is required.");
        }

        // Get current availability
        $stmt = $mysqli->prepare("SELECT availability FROM items WHERE id = ?");
        $stmt->bind_param("i", $item_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Item not found.");
        }
        
        $current_availability = $result->fetch_assoc()['availability'];
        $stmt->close();

        // Toggle availability
        $new_availability = $current_availability ? 0 : 1;
        $stmt = $mysqli->prepare("UPDATE items SET availability = ? WHERE id = ?");
        $stmt->bind_param("ii", $new_availability, $item_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update availability.");
        }
        $stmt->close();

        $response = [
            "success" => true,
            "message" => "Availability updated successfully",
            "new_availability" => (bool)$new_availability
        ];

    } elseif ($action === 'update_price') {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            throw new Exception("Only POST requests are allowed.");
        }

        $item_id = $_POST['item_id'] ?? 0;
        $new_price = $_POST['price'] ?? 0;

        if (empty($item_id) || empty($new_price)) {
            throw new Exception("Item ID and price are required.");
        }

        if (!is_numeric($new_price) || $new_price < 0) {
            throw new Exception("Invalid price. Must be a positive number.");
        }

        $stmt = $mysqli->prepare("UPDATE items SET price = ? WHERE id = ?");
        $stmt->bind_param("di", $new_price, $item_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update price.");
        }
        $stmt->close();

        $response = [
            "success" => true,
            "message" => "Price updated successfully"
        ];

    } elseif ($action === 'update_item') {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            throw new Exception("Only POST requests are allowed.");
        }

        $item_id = $_POST['item_id'] ?? 0;
        $name = $_POST['name'] ?? '';
        $description = $_POST['item_desc'] ?? '';
        $price = $_POST['price'] ?? 0;

        if (empty($item_id)) {
            throw new Exception("Item ID is required.");
        }

        if (empty($name)) {
            throw new Exception("Item name is required.");
        }

        if (!is_numeric($price) || $price < 0) {
            throw new Exception("Invalid price. Must be a positive number.");
        }

        $stmt = $mysqli->prepare("UPDATE items SET name = ?, item_desc = ?, price = ? WHERE id = ?");
        $stmt->bind_param("ssdi", $name, $description, $price, $item_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update item.");
        }
        $stmt->close();

        $response = [
            "success" => true,
            "message" => "Item updated successfully"
        ];

    } elseif ($action === 'deprecate') {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            throw new Exception("Only POST requests are allowed.");
        }

        $item_id = $_POST['item_id'] ?? 0;

        if (empty($item_id)) {
            throw new Exception("Item ID is required.");
        }

        $stmt = $mysqli->prepare("UPDATE items SET is_deprecated = TRUE WHERE id = ?");
        $stmt->bind_param("i", $item_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to deprecate item.");
        }
        $stmt->close();

        $response = [
            "success" => true,
            "message" => "Item deprecated successfully"
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
