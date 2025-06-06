
 
class ItemInteract extends HTMLElement {
    itemId;
    container;
    constructor(itemId, container=null) {
        super();
        this.itemId = itemId;
        this.container = container;
    }
    incrementCount() {
        if (!user.getUserId()) {
            alert("Sign In to get started!");
            return;
        }
        user.addQty(this.itemId, 1);
        if (!this.container)
            this.render();
        else
            this.container.render();
    }
    decrementCount() {
        if (!user.getUserId()) {
            alert("Sign In to get started!");
            return;
        }
        user.addQty(this.itemId, -1);
        if (!this.container)
            this.render();
        else
            this.container.render();
    }
    render() {

    }
    connectedCallback() {
        this.render();
    }

}

class MenuItemInteract extends ItemInteract {
    constructor(itemId) {
        super(itemId);
        this.itemId = itemId;
    }
    render() {

        if (user.getCart()[this.itemId]) {   // +ve int
            this.innerHTML = `
                <span class="alter-cnt">
                    <span class="item-qty">${user.getCart()[this.itemId]}</span>
                    <button class="item-btn plus-item" type="button">+</button>
                    <button class="item-btn minus-item" type="button">-</button>
                </span>
            `;
        } else {
            this.innerHTML = `
                <span>
                    <button class="item-btn plus-item" type="button">Add To Cart</button>
                </span>
            `;
        }
        // Bind event listener for adding to cart
        requestAnimationFrame(() => {
            try {
                const plusButton = this.querySelector(".plus-item");
                plusButton.addEventListener('click', this.incrementCount.bind(this));
                const minusButton = this.querySelector(".minus-item");
                if (minusButton)
                    minusButton.addEventListener('click', this.decrementCount.bind(this));
            } catch (error) {
                console.log("Everything is fine  😊");
            }
        });
    }
}

class CartItemInteract extends ItemInteract {
    constructor(itemId, itemContainer) {
        super(itemId, itemContainer);
        // this.itemId = itemId;
        // this.itemContainer = itemContainer;
    }
    render() {
        this.innerHTML = `
            <span class="alter-cnt">
                <button class="item-btn plus-item" type="button">+</button>
                <button class="item-btn minus-item" type="button">-</button>
            </span>
        `;
        requestAnimationFrame(() => {
            try {
                const plusButton = this.querySelector(".plus-item");
                plusButton.addEventListener('click', this.incrementCount.bind(this));
                const minusButton = this.querySelector(".minus-item");
                minusButton.addEventListener('click', this.decrementCount.bind(this));
            } catch (error) {
                console.log("Everything is fine  😊");
            }
        });
    }
}
///////////   Cart page
class CartEntry extends HTMLElement {

    static serialNumber = 1;

    constructor(itemId, name, price) {
        super();
        this.itemId = itemId;
        this.name = name;
        this.price = price;
        this.interact = new CartItemInteract(itemId, this);
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const qty = user.getCart()[this.itemId];
        if (!qty) {       // qty set to zero
            // write some code to confirm user's choice to delete
            this.innerHTML = ``;
            return;
        }
        this.innerHTML = `
            <div class="cart-entry">
                <img class="cart-thumb" src="../assets/img/menu/${this.itemId}-thumbnail.jpg" alt="${this.name}">
                <span class="cart-item-name">${this.name}</span>
                <div class="cart-item-meta">
                    <span class="cart-item-price">$${this.price}</span>
                    <span class="cart-item-qty">x${qty}</span>
                    <span class="cart-item-total">$${(qty * this.price).toFixed(2)}</span>
                </div>
                <div class="cart-actions"></div>
            </div>
        `;
        if (CartEntry.serialNumber > Object.keys(user.getCart()).length)
            CartEntry.serialNumber = 1;

        this.querySelector(".cart-actions").appendChild(this.interact);
    }
}   


class InteractButton extends HTMLElement {
    itemId;
    constructor(itemId) {
        super();
        // console.log(itemId);
        this.itemId = itemId;
        // console.log(this.itemId);
    }

    incrementCount() {
        // this.count = user.addQty(this.itemId, 1);   // add 1 to this items qty in local storage
        // alert(`More for you😋 ${this.count}`);
        user.addQty(this.itemId, 1);
        this.updateDisplay();
    }
    decrementCount() {
        // this.count = user.addQty(this.itemId, -1);
        // alert(`Less for you🤦‍♀️ ${this.count}`);
        user.addQty(this.itemId, -1);
        this.updateDisplay();
    }
    updateDisplay() {
        if (user.getCart()[this.itemId]) {   // +ve int
            this.innerHTML = `
                <span class="alter-cnt">
                    <span class="item-qty">${user.getCart()[this.itemId]}</span>
                    <button class="item-btn plus-item" type="button">+</button>
                    <button class="item-btn minus-item" type="button">-</button>
                </span>
            `;
        } else {
            this.innerHTML = `
                <span>
                    <button class="item-btn plus-item" type="button">Add To Cart</button>
                </span>
            `;
        }
        // Bind event listener for adding to cart
        requestAnimationFrame(() => {
            try {
                const plusButton = this.querySelector(".plus-item");
                plusButton.addEventListener('click', this.incrementCount.bind(this));
                const minusButton = this.querySelector(".minus-item");
                if (minusButton)
                    minusButton.addEventListener('click', this.decrementCount.bind(this));
            } catch (error) {
                console.log("Everything is fine  😊");
            }
        });
    }

    connectedCallback() {
        // this.count = user.getCart()[this.itemId];
        this.updateDisplay();
    }
}

class NonInteractButton extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = `
            <span>
                <button class="item-btn" type="button">Add To Cart</button>
            </span>
        `
        requestAnimationFrame(() => {
            const cartButton = this.querySelector(".item-btn");
            cartButton.addEventListener('click', this.alertLogin.bind(this));
        })
    }
    alertLogin() {
        alert("Sign In to get started!");
    }
}