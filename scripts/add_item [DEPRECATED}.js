


function addItem() {
   
    const addToCartButtons = document.querySelectorAll('.add-cart-btn');

    const cart = document.getElementById('cart');
    const cartItems = document.getElementById('cart-items');

    function addItemToCart(event) {
        alert("hellow");
        console.log("HEllow");
        const product = event.target.parentElement;
        const productName = product.querySelector('h3').innerText;

        const cartItem = document.createElement('li');
        cartItem.innerText = productName;

        cartItems.appendChild(cartItem);
    }

    addToCartButtons.forEach(button => {
    button.addEventListener('click', addItemToCart);
    });
}