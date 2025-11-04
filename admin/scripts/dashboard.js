// Dashboard Page Logic

let revenueChart, topItemsChart, orderStatusChart, paymentMethodChart;

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('php/analytics.php?action=summary');
        const result = await response.json();
        
        if (result.success) {
            updateMetrics(result.data);
            renderCharts(result.data);
        } else {
            showToast(result.error || 'Failed to load dashboard data', 'error');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// Update metric cards
function updateMetrics(data) {
    // Total Revenue
    const totalRevenueEl = document.getElementById('totalRevenue');
    if (totalRevenueEl) {
        animateNumber(totalRevenueEl, 0, data.total_revenue, 1500);
    }
    
    // Orders Today
    const ordersTodayEl = document.getElementById('ordersToday');
    if (ordersTodayEl) {
        animateNumber(ordersTodayEl, 0, data.orders_today, 1500);
    }
    
    // Average Order Value
    const avgOrderValueEl = document.getElementById('avgOrderValue');
    if (avgOrderValueEl) {
        animateNumber(avgOrderValueEl, 0, data.avg_order_value, 1500);
    }
    
    // Customer Count
    const customerCountEl = document.getElementById('customerCount');
    if (customerCountEl) {
        animateNumber(customerCountEl, 0, data.customer_count, 1500);
    }
}

// Render all charts
function renderCharts(data) {
    renderRevenueChart();
    renderTopItemsChart(data.top_items);
    renderOrderStatusChart(data.orders_by_status);
    renderPaymentMethodChart(data.revenue_by_method);
}

// Revenue Line Chart
async function renderRevenueChart() {
    try {
        const response = await fetch('php/analytics.php?action=sales_chart&period=week');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        // Destroy existing chart if any
        if (revenueChart) {
            revenueChart.destroy();
        }
        
        const labels = result.data.map(item => formatDateOnly(item.date));
        const revenues = result.data.map(item => parseFloat(item.revenue));
        
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue',
                    data: revenues,
                    borderColor: '#3498DB',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Revenue: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering revenue chart:', error);
    }
}

// Top Items Bar Chart
function renderTopItemsChart(topItems) {
    const ctx = document.getElementById('topItemsChart');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (topItemsChart) {
        topItemsChart.destroy();
    }
    
    if (!topItems || topItems.length === 0) {
        ctx.parentElement.innerHTML = '<div class="chart-no-data">No data available</div>';
        return;
    }
    
    const labels = topItems.map(item => item.name);
    const quantities = topItems.map(item => parseInt(item.total_qty));
    
    topItemsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantity Sold',
                data: quantities,
                backgroundColor: '#27AE60',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Order Status Pie Chart
function renderOrderStatusChart(ordersByStatus) {
    const ctx = document.getElementById('orderStatusChart');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (orderStatusChart) {
        orderStatusChart.destroy();
    }
    
    if (!ordersByStatus || Object.keys(ordersByStatus).length === 0) {
        ctx.parentElement.innerHTML = '<div class="chart-no-data">No data available</div>';
        return;
    }
    
    const labels = Object.keys(ordersByStatus);
    const counts = Object.values(ordersByStatus);
    
    const colors = {
        'Placed': '#F39C12',
        'Confirmed': '#3498DB',
        'Preparing': '#E67E22',
        'Out for Delivery': '#9B59B6',
        'Delivered': '#27AE60',
        'Cancelled': '#E74C3C'
    };
    
    const backgroundColors = labels.map(label => colors[label] || '#95A5A6');
    
    orderStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Payment Method Pie Chart
function renderPaymentMethodChart(revenueByMethod) {
    const ctx = document.getElementById('paymentMethodChart');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (paymentMethodChart) {
        paymentMethodChart.destroy();
    }
    
    if (!revenueByMethod || revenueByMethod.length === 0) {
        ctx.parentElement.innerHTML = '<div class="chart-no-data">No data available</div>';
        return;
    }
    
    const labels = revenueByMethod.map(item => item.method_name);
    const revenues = revenueByMethod.map(item => parseFloat(item.total_amount));
    
    const colors = ['#3498DB', '#27AE60', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C'];
    
    paymentMethodChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: revenues,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.parsed);
                        }
                    }
                }
            }
        }
    });
}

// Load recent orders
async function loadRecentOrders() {
    try {
        const response = await fetch('php/orders.php?action=list');
        const result = await response.json();
        
        if (result.success) {
            renderRecentOrders(result.data.slice(0, 10));
        } else {
            showToast(result.error || 'Failed to load recent orders', 'error');
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        showToast('Failed to load recent orders', 'error');
    }
}

// Render recent orders table
function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersBody');
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.first_name} ${order.last_name}</td>
            <td>${formatDate(order.order_time)}</td>
            <td>${formatCurrency(order.total_amount)}</td>
            <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
            <td><span class="badge ${getStatusBadgeClass(order.payment_status)}">${order.payment_status || 'N/A'}</span></td>
        </tr>
    `).join('');
}

// Initialize dashboard
async function initDashboard() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    setActiveNav('dashboard');
    await loadDashboardData();
    await loadRecentOrders();
    
    // Refresh data every 30 seconds
    setInterval(async () => {
        await loadDashboardData();
        await loadRecentOrders();
    }, 30000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
