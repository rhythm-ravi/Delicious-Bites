// Orders Page Logic

let currentOrders = [];
let currentFilter = 'all';

// Load orders
async function loadOrders(status = 'all') {
    try {
        const response = await fetch(`php/orders.php?action=list&status=${status}`);
        const result = await response.json();
        
        if (result.success) {
            currentOrders = result.data;
            renderOrdersTable(currentOrders);
        } else {
            showToast(result.error || 'Failed to load orders', 'error');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders', 'error');
    }
}

// Render orders table
function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.first_name} ${order.last_name}</td>
            <td>${formatDate(order.order_time)}</td>
            <td>${formatCurrency(order.total_amount)}</td>
            <td>
                <select class="status-select" data-order-id="${order.id}" onchange="updateOrderStatus(${parseInt(order.id)}, this.value)">
                    <option value="Placed" ${order.status === 'Placed' ? 'selected' : ''}>Placed</option>
                    <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td><span class="badge ${getStatusBadgeClass(order.payment_status)}">${order.payment_status || 'N/A'}</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewOrderDetails(${parseInt(order.id)})">View</button>
            </td>
        </tr>
    `).join('');
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const formData = new FormData();
        formData.append('order_id', orderId);
        formData.append('status', newStatus);
        formData.append('action', 'update_status');
        
        const response = await fetch('php/orders.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Order status updated successfully', 'success');
            await loadOrders(currentFilter);
        } else {
            showToast(result.error || 'Failed to update order status', 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Failed to update order status', 'error');
    }
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`php/orders.php?action=details&order_id=${orderId}`);
        const result = await response.json();
        
        if (result.success) {
            showOrderDetailsModal(result.data);
        } else {
            showToast(result.error || 'Failed to load order details', 'error');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showToast('Failed to load order details', 'error');
    }
}

// Show order details modal
function showOrderDetailsModal(order) {
    const modal = document.getElementById('orderDetailsModal');
    if (!modal) return;
    
    // Parse address JSON
    let address = {};
    try {
        address = JSON.parse(order.address_json);
    } catch (e) {
        console.error('Error parsing address:', e);
    }
    
    // Customer info
    document.getElementById('modalOrderId').textContent = `#${order.id}`;
    document.getElementById('modalCustomerName').textContent = `${order.first_name} ${order.last_name}`;
    document.getElementById('modalCustomerEmail').textContent = order.email_id;
    document.getElementById('modalCustomerMobile').textContent = order.mobile;
    
    // Order info
    document.getElementById('modalOrderTime').textContent = formatDate(order.order_time);
    document.getElementById('modalOrderStatus').innerHTML = `<span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>`;
    document.getElementById('modalPaymentStatus').innerHTML = `<span class="badge ${getStatusBadgeClass(order.payment_status)}">${order.payment_status || 'N/A'}</span>`;
    document.getElementById('modalPaymentMethod').textContent = order.method_name || 'N/A';
    
    // Address
    let addressHtml = '';
    if (address.address1) addressHtml += address.address1 + '<br>';
    if (address.address2) addressHtml += address.address2 + '<br>';
    if (address.landmark) addressHtml += 'Landmark: ' + address.landmark + '<br>';
    if (address.postal_code) addressHtml += 'PIN: ' + address.postal_code + '<br>';
    if (address.state) addressHtml += address.state;
    document.getElementById('modalAddress').innerHTML = addressHtml || 'N/A';
    
    // Items
    const itemsTableBody = document.getElementById('modalItemsTable');
    if (order.items && order.items.length > 0) {
        itemsTableBody.innerHTML = order.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${item.qty}</td>
                <td>${formatCurrency(item.price * item.qty)}</td>
            </tr>
        `).join('');
    } else {
        itemsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No items found</td></tr>';
    }
    
    // Total
    document.getElementById('modalTotal').textContent = formatCurrency(order.total_amount);
    
    // Notes
    document.getElementById('modalNotes').textContent = order.notes || 'No notes';
    
    showModal('orderDetailsModal');
}

// Filter orders by status
function filterOrders(status) {
    currentFilter = status;
    loadOrders(status);
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.status === status) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Search orders
function searchOrders() {
    const searchTerm = document.getElementById('searchInput').value;
    searchTable('ordersTable', searchTerm);
}

// Initialize orders page
async function initOrders() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    setActiveNav('orders');
    await loadOrders();
    
    // Setup search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchOrders);
    }
    
    // Setup filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterOrders(btn.dataset.status);
        });
    });
    
    // Auto-refresh every 10 seconds
    setInterval(() => {
        loadOrders(currentFilter);
    }, 10000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initOrders);
