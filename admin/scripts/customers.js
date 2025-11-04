// Customers Page Logic

let currentCustomers = [];

// Load customers
async function loadCustomers() {
    try {
        const response = await fetch('php/customers.php?action=list');
        const result = await response.json();
        
        if (result.success) {
            currentCustomers = result.data;
            renderCustomersTable(currentCustomers);
        } else {
            showToast(result.error || 'Failed to load customers', 'error');
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        showToast('Failed to load customers', 'error');
    }
}

// Render customers table
function renderCustomersTable(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No customers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.username}</td>
            <td>${customer.first_name} ${customer.last_name || ''}</td>
            <td>${customer.email_id}</td>
            <td>${customer.mobile}</td>
            <td>${customer.total_orders || 0}</td>
            <td>${formatCurrency(customer.total_spent || 0)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewCustomerDetails(${parseInt(customer.id)})">View</button>
            </td>
        </tr>
    `).join('');
}

// View customer details
async function viewCustomerDetails(customerId) {
    try {
        const response = await fetch(`php/customers.php?action=details&cust_id=${customerId}`);
        const result = await response.json();
        
        if (result.success) {
            showCustomerDetailsModal(result.data);
        } else {
            showToast(result.error || 'Failed to load customer details', 'error');
        }
    } catch (error) {
        console.error('Error loading customer details:', error);
        showToast('Failed to load customer details', 'error');
    }
}

// Show customer details modal
function showCustomerDetailsModal(customer) {
    const modal = document.getElementById('customerDetailsModal');
    if (!modal) return;
    
    // Basic info
    document.getElementById('modalCustomerUsername').textContent = customer.username;
    document.getElementById('modalCustomerName').textContent = `${customer.first_name} ${customer.last_name || ''}`;
    document.getElementById('modalCustomerEmail').textContent = customer.email_id;
    document.getElementById('modalCustomerMobile').textContent = customer.mobile;
    
    // Statistics
    const stats = customer.stats || {};
    document.getElementById('modalTotalOrders').textContent = stats.total_orders || 0;
    document.getElementById('modalTotalSpent').textContent = formatCurrency(stats.total_spent || 0);
    document.getElementById('modalAvgOrderValue').textContent = formatCurrency(stats.avg_order_value || 0);
    
    // Order history
    const ordersTableBody = document.getElementById('modalOrdersTable');
    if (customer.orders && customer.orders.length > 0) {
        ordersTableBody.innerHTML = customer.orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${formatDate(order.order_time)}</td>
                <td>${formatCurrency(order.total_amount)}</td>
                <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
                <td><span class="badge ${getStatusBadgeClass(order.payment_status)}">${order.payment_status || 'N/A'}</span></td>
            </tr>
        `).join('');
    } else {
        ordersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
    }
    
    // Addresses
    const addressesDiv = document.getElementById('modalAddresses');
    if (customer.addresses && customer.addresses.length > 0) {
        addressesDiv.innerHTML = customer.addresses.map(addr => `
            <div style="margin-bottom: 15px; padding: 15px; background-color: var(--background-color); border-radius: 8px;">
                <strong>${addr.name || 'Address'}</strong><br>
                ${addr.address1 || ''}<br>
                ${addr.address2 ? addr.address2 + '<br>' : ''}
                ${addr.landmark ? 'Landmark: ' + addr.landmark + '<br>' : ''}
                PIN: ${addr.postal_code || 'N/A'}<br>
                ${addr.state || ''}
            </div>
        `).join('');
    } else {
        addressesDiv.innerHTML = '<p>No saved addresses</p>';
    }
    
    showModal('customerDetailsModal');
}

// Search customers
function searchCustomers() {
    const searchTerm = document.getElementById('searchInput').value;
    searchTable('customersTable', searchTerm);
}

// Initialize customers page
async function initCustomers() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    setActiveNav('customers');
    await loadCustomers();
    
    // Setup search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchCustomers);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCustomers);
