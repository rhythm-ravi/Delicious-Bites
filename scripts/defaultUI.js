function placeBase() {      // places reusable base components for all html pages
    
    // header and footer
    let header_footer = document.getElementById("header-footer");
    header_footer.innerHTML = `
        <header>
            <h1>Delicious Bites🍔</h1>
            <div id="navbar"></div>
        </header>

        <footer>
            &copy; 2024 Delicious Bites🍔. All rights reserved.
        </footer>
    `
    // nav
    populateNav();
}



function populateNav() {
    let navDiv = document.getElementById("navbar");

    let signInOut;
    if (!user.getUserId())      // not logged in
        signInOut = `<a href="login.html">Log In</a>`;
    else {
        // Calculate cart item count
        const cart = user.getCart();
        const cartCount = Object.keys(cart).reduce((sum, key) => sum + cart[key], 0);
        const cartBadge = cartCount > 0 ? `<span class='cart-badge'>${cartCount}</span>` : '';
        
        signInOut = `
            <a href="cart.html" class="cart-link">Cart${cartBadge}</a>
            <a href="order_history.html">Orders</a>

            <span class='user-card'>
                <a>${user.getUserName()}</a>
                <div class='tooltip'>
                    <button onclick='signOut()'> SignOut </button>
                </div>
            </span>


        `;
    }
    navDiv.innerHTML = `
        <nav>
            <a href="home.html">Home</a>
            <a href="#menu">Menu</a>
            <a href="#">About</a>
            ${signInOut}
        </nav>
    `;
}