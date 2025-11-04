// Inventory Page Logic

let currentItems = [];

// Load inventory items
async function loadInventory() {
    try {
        const response = await fetch('php/inventory.php?action=list');
        const result = await response.json();
        
        if (result.success) {
            currentItems = result.data;
            renderInventoryTable(currentItems);
        } else {
            showToast(result.error || 'Failed to load inventory', 'error');
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
        showToast('Failed to load inventory', 'error');
    }
}

// Render inventory table
function renderInventoryTable(items) {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No items found</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => {
        const isDeprecated = item.is_deprecated == 1;
        const deprecatedStyle = isDeprecated ? 'opacity: 0.5; text-decoration: line-through;' : '';
        
        return `
            <tr style="${deprecatedStyle}">
                <td>${item.code || 'N/A'}</td>
                <td>${item.name}</td>
                <td class="editable-price" data-item-id="${item.id}" onclick="editPrice(${parseInt(item.id)}, ${parseFloat(item.price)}, event)">
                    ${formatCurrency(item.price)}
                </td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" ${item.availability == 1 ? 'checked' : ''} 
                               onchange="toggleAvailability(${parseInt(item.id)})" ${isDeprecated ? 'disabled' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </td>
                <td>
                    <span class="badge ${isDeprecated ? 'badge-secondary' : 'badge-success'}">
                        ${isDeprecated ? 'Deprecated' : 'Active'}
                    </span>
                </td>
                <td>${item.item_desc || 'No description'}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editItem(${parseInt(item.id)})" ${isDeprecated ? 'disabled' : ''}>Edit</button>
                    ${!isDeprecated ? `<button class="btn btn-danger btn-sm" onclick="confirmDeprecate(${parseInt(item.id)})">Deprecate</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Toggle availability
async function toggleAvailability(itemId) {
    try {
        const formData = new FormData();
        formData.append('item_id', itemId);
        formData.append('action', 'toggle_availability');
        
        const response = await fetch('php/inventory.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Availability updated successfully', 'success');
            await loadInventory();
        } else {
            showToast(result.error || 'Failed to update availability', 'error');
            await loadInventory(); // Reload to reset the toggle
        }
    } catch (error) {
        console.error('Error toggling availability:', error);
        showToast('Failed to update availability', 'error');
        await loadInventory();
    }
}

// Edit price inline
function editPrice(itemId, currentPrice, event) {
    const priceCell = event.target;
    
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.01';
    input.min = '0';
    input.value = currentPrice;
    input.className = 'price-input';
    
    priceCell.textContent = '';
    priceCell.appendChild(input);
    input.focus();
    input.select();
    
    // Save on blur or Enter
    const savePrice = async () => {
        const newPrice = parseFloat(input.value);
        
        if (isNaN(newPrice) || newPrice < 0) {
            showToast('Invalid price', 'error');
            await loadInventory();
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('item_id', itemId);
            formData.append('price', newPrice);
            formData.append('action', 'update_price');
            
            const response = await fetch('php/inventory.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('Price updated successfully', 'success');
                await loadInventory();
            } else {
                showToast(result.error || 'Failed to update price', 'error');
                await loadInventory();
            }
        } catch (error) {
            console.error('Error updating price:', error);
            showToast('Failed to update price', 'error');
            await loadInventory();
        }
    };
    
    input.addEventListener('blur', savePrice);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            savePrice();
        } else if (e.key === 'Escape') {
            loadInventory();
        }
    });
}

// Edit item details
function editItem(itemId) {
    const item = currentItems.find(i => i.id == itemId);
    if (!item) return;
    
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemPrice').value = item.price;
    document.getElementById('editItemDesc').value = item.item_desc || '';
    
    showModal('editItemModal');
}

// Save item changes
async function saveItemChanges() {
    const itemId = document.getElementById('editItemId').value;
    const name = document.getElementById('editItemName').value;
    const price = document.getElementById('editItemPrice').value;
    const description = document.getElementById('editItemDesc').value;
    
    if (!name || !price) {
        showToast('Name and price are required', 'error');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('item_id', itemId);
        formData.append('name', name);
        formData.append('price', price);
        formData.append('item_desc', description);
        formData.append('action', 'update_item');
        
        const response = await fetch('php/inventory.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Item updated successfully', 'success');
            hideModal('editItemModal');
            await loadInventory();
        } else {
            showToast(result.error || 'Failed to update item', 'error');
        }
    } catch (error) {
        console.error('Error updating item:', error);
        showToast('Failed to update item', 'error');
    }
}

// Confirm deprecate item
function confirmDeprecate(itemId) {
    if (confirm('Are you sure you want to deprecate this item? This action cannot be undone.')) {
        deprecateItem(itemId);
    }
}

// Deprecate item
async function deprecateItem(itemId) {
    try {
        const formData = new FormData();
        formData.append('item_id', itemId);
        formData.append('action', 'deprecate');
        
        const response = await fetch('php/inventory.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Item deprecated successfully', 'success');
            await loadInventory();
        } else {
            showToast(result.error || 'Failed to deprecate item', 'error');
        }
    } catch (error) {
        console.error('Error deprecating item:', error);
        showToast('Failed to deprecate item', 'error');
    }
}

// Search inventory
function searchInventory() {
    const searchTerm = document.getElementById('searchInput').value;
    searchTable('inventoryTable', searchTerm);
}

// Initialize inventory page
async function initInventory() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    setActiveNav('inventory');
    await loadInventory();
    
    // Setup search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchInventory);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initInventory);
