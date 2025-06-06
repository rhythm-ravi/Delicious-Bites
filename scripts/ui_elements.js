
 
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

    constructor(itemId, price) {
        super();
        this.itemId = itemId;
        this.price = price;
        this.interact = new CartItemInteract(itemId, this);
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (!user.getCart()[this.itemId]) {       // qty set to zero
            // write some code to confirm user's choice to delete
            this.innerHTML = ``;
            return;
        }
        this.innerHTML = `
            <div class="cart-entry">
                <!--<span style="text-align: centre">${CartEntry.serialNumber++}</span>-->
                <span>${user.getCart()[this.itemId]}</span>
                <span>${user.getCart()[this.itemId]*this.price}</span>
            </div>
        `;
        if (CartEntry.serialNumber > Object.keys(user.getCart()).length)
            CartEntry.serialNumber = 1;

        this.querySelector(".cart-entry").appendChild(this.interact);
    }
        // this.innerHTML = `
        // <h1>hullo</h1>
        //     <tr>
        //         <td class="item-id">${this.item.id}</td>
        //         <td class="item-name">${this.item.name}</td>
        //         <td class="item-price">${this.item.price}</td>
        //         <td class="item-qty">${this.qty}</td>
        //         <td>${this.item.price * this.qty}</td>
        //     </tr>
        // `

        // const tr = document.createElement("tr");

        // const td1 = this.createTd(this.item.id, "item-id");
        // const td2 = this.createTd(this.item.name, "item-name");
        // const td3 = this.createTd(`$${this.item.price}`, "item-price");
        // const td4 = this.createTd(this.qty, "item-qty");
        // const td5 = this.createTd(`$${(this.qty * this.item.price).toFixed(2)}`, "");

        // tr.appendChild(td1);
        // tr.appendChild(td2);
        // tr.appendChild(td3);
        // tr.appendChild(td4);
        // tr.appendChild(td5);

        // // this.appendChild(tr);
        // const tr = document.createElement("tr");
        // const td1 = document.createElement("td");   td1.setAttribute("class", "item-id");
        // td1.innerHTML = `${this.item.id}`;
        // const td2 = document.createElement("td");   td1.setAttribute("class", "item-name");
        // td2.innerHTML = `${this.item.name}`;
        // const td3 = document.createElement("td");   td1.setAttribute("class", "item-price");
        // td3.innerHTML = `${this.item.price}`;
        // const td4 = document.createElement("td");   td1.setAttribute("class", "item-qty");
        // td4.innerHTML = `${this.qty}`;
        // const td5 = document.createElement("td");
        // td5.innerHTML = `${this.qty * this.item.price}`;

        // tr.appendChild(td1);
        // tr.appendChild(td2);
        // tr.appendChild(td3);
        // tr.appendChild(td4);
        // tr.appendChild(td5);

        // this.appendChild(tr);  // Append the <tr> to the custom element itself
    // }
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