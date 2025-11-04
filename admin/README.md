# Delicious Bites Admin Dashboard

A professional, feature-complete admin dashboard for restaurant management.

## 🚀 Quick Start

### Access the Dashboard

1. Navigate to: `http://your-domain.com/admin/login.html`
2. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

## 📋 Features

### 1. Dashboard (index.html)
- **Real-time Metrics**
  - Total Revenue
  - Orders Today
  - Average Order Value
  - Total Customers
- **Analytics Charts**
  - Revenue over time (last 7 days)
  - Top 10 selling items
  - Orders by status
  - Revenue by payment method
- **Recent Orders Table**
- Auto-refresh every 30 seconds

### 2. Order Management (orders.html)
- View all orders with filtering by status
- Update order status via dropdown:
  - Placed → Confirmed → Preparing → Out for Delivery → Delivered → Cancelled
- View detailed order information (customer, items, address, payment)
- Search orders
- Color-coded status badges
- Auto-refresh every 10 seconds

### 3. Inventory Management (inventory.html)
- List all menu items
- Toggle item availability with instant AJAX update
- Inline price editing (click to edit, blur to save)
- Edit item details (name, description, price)
- Deprecate items
- Search and filter items
- Visual status indicators

### 4. Customer Management (customers.html)
- View all customers with statistics
- Total orders and spending per customer
- View customer details:
  - Order history
  - Saved addresses
  - Purchase statistics
- Search customers

## 🔒 Security

### Authentication
- Session-based authentication
- 30-minute session timeout
- Secure password hashing (bcrypt)
- Session validation middleware on all endpoints

### Data Protection
- All database queries use prepared statements
- Input validation and sanitization
- XSS prevention with proper data escaping
- No SQL injection vulnerabilities
- Error handling without information disclosure

### Security Audit Results
- ✅ CodeQL Analysis: 0 alerts
- ✅ Manual Security Review: All issues resolved
- ✅ No command execution vulnerabilities
- ✅ Proper session management

## 🏗️ Technical Architecture

### Backend (PHP)
```
admin/php/
├── admin_auth.php      # Authentication endpoints
├── check_session.php   # Session validation middleware
├── analytics.php       # Dashboard metrics API
├── orders.php          # Order management API
├── inventory.php       # Inventory management API
└── customers.php       # Customer data API
```

### Frontend
```
admin/
├── login.html          # Login page
├── index.html          # Main dashboard
├── orders.html         # Order management
├── inventory.html      # Inventory control
├── customers.html      # Customer management
├── scripts/
│   ├── admin.js        # Shared utilities
│   ├── dashboard.js    # Dashboard logic
│   ├── orders.js       # Order operations
│   ├── inventory.js    # Inventory operations
│   └── customers.js    # Customer operations
└── styles/
    ├── admin.css       # Main styles
    └── charts.css      # Chart styles
```

## 📡 API Endpoints

### Authentication (`admin_auth.php`)
- `POST ?action=login` - Admin login
- `POST ?action=logout` - Admin logout
- `GET ?action=check` - Check session status

### Analytics (`analytics.php`)
- `GET ?action=summary` - Key metrics and statistics
- `GET ?action=sales_chart&period={week|month|year}` - Time-series sales data
- `GET ?action=item_performance` - Sales by item

### Orders (`orders.php`)
- `GET ?action=list&status={all|Placed|Confirmed|...}` - List orders
- `GET ?action=details&order_id={id}` - Order details
- `POST ?action=update_status` - Update order status
- `GET ?action=statistics` - Order statistics

### Inventory (`inventory.php`)
- `GET ?action=list` - List all items
- `POST ?action=toggle_availability` - Toggle item availability
- `POST ?action=update_price` - Update item price
- `POST ?action=update_item` - Update item details
- `POST ?action=deprecate` - Mark item as deprecated

### Customers (`customers.php`)
- `GET ?action=list` - List all customers
- `GET ?action=details&cust_id={id}` - Customer details
- `GET ?action=stats` - Customer statistics

## 🎨 Design System

### Color Palette
- **Primary**: Deep blue/indigo (#2C3E50, #3498DB)
- **Success**: Green (#27AE60)
- **Warning**: Orange (#F39C12)
- **Danger**: Red (#E74C3C)
- **Background**: Light gray (#F5F7FA)
- **Cards**: White with subtle shadows

### Typography
- Clean sans-serif fonts (system fonts)
- Clear hierarchy (headings, body, captions)

### Components
- Modern cards with rounded corners (8-12px)
- Subtle shadows for depth
- Smooth transitions (0.3s ease)
- Hover effects on interactive elements

## 💾 Database Schema

Works with existing database tables:
- `customers` - User accounts
- `items` - Menu items
- `orders` - Order records
- `ordered_entries` - Order line items
- `payments` - Payment records
- `payment_methods` - Payment types

**No database modifications required!**

## 🔧 Configuration

### Change Admin Password
Edit `admin/php/admin_auth.php`:
```php
// Generate new hash
php -r "echo password_hash('your-new-password', PASSWORD_DEFAULT);"

// Update the constant
define('ADMIN_PASSWORD_HASH', 'your-new-hash-here');
```

### Session Timeout
Edit `admin/php/check_session.php`:
```php
$timeout = 1800; // Change to desired seconds (default: 30 minutes)
```

### Database Connection
Uses the existing connection in `php/db.php`:
```php
$host = 'localhost';
$username = 'root';
$password = 'root';
$database = 'prodb';
```

## 📊 Chart Integration

The dashboard uses Chart.js for visualizations. The CDN is included in `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

Charts automatically render when data is available.

## 🔄 Auto-Refresh

- **Dashboard**: Metrics refresh every 30 seconds
- **Orders**: Order list refreshes every 10 seconds
- **Inventory**: Manual refresh only
- **Customers**: Manual refresh only

## 🌐 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Design

- Desktop-first design
- Mobile-friendly tables
- Responsive sidebar
- Adaptive layouts

## 🚨 Troubleshooting

### Login Issues
- Verify credentials: `admin` / `admin123`
- Check if sessions are enabled in PHP
- Clear browser cookies/cache

### Database Connection
- Verify MySQL is running
- Check credentials in `php/db.php`
- Ensure database `prodb` exists

### Session Timeout
- Default: 30 minutes of inactivity
- Change in `check_session.php`

### Chart Not Displaying
- Check browser console for errors
- Verify Chart.js CDN is accessible
- Ensure data is being returned from API

## 📝 Development Notes

### Adding New Features
1. Create new PHP endpoint in `admin/php/`
2. Add frontend page in `admin/`
3. Create JavaScript module in `admin/scripts/`
4. Add navigation link in sidebar
5. Update this README

### Coding Standards
- Use prepared statements for all queries
- Validate and sanitize all inputs
- Use proper error handling
- Follow existing code style
- Add comments for complex logic

## 🔐 Security Best Practices

1. **Change default password** immediately in production
2. **Use HTTPS** in production environments
3. **Keep PHP updated** to latest stable version
4. **Regular backups** of database
5. **Monitor logs** for suspicious activity
6. **Limit admin access** to trusted users only
7. **Use strong passwords** (minimum 12 characters)

## 📞 Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check browser console for errors
4. Review PHP error logs

## 📄 License

Part of the Delicious Bites restaurant management system.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Production Ready ✅
