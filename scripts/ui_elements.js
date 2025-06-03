class InteractButton extends HTMLElement {
    itemId;
    constructor(itemId) {
        super();
        // console.log(itemId);
        this.itemId = itemId;
        // console.log(this.itemId);
    }

    incrementCount() {
        this.count = user.addQty(this.itemId, 1);   // add 1 to this items qty in local storage
        // alert(`More for you😋 ${this.count}`);
        this.updateDisplay();
    }
    decrementCount() {
        this.count = user.addQty(this.itemId, -1);
        // alert(`More for you😋 ${this.count}`);
        this.updateDisplay();
    }
    updateDisplay() {
        // this.count = user.getCart()[this.itemId];
        // console.log(user.getCart());
        // console.log(this.count);
        if (this.count) {   // +ve int
            this.innerHTML = `
                <span class="alter-cnt">
                    <span class="item-qty">${this.count}</span>
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
                minusButton.addEventListener('click', this.decrementCount.bind(this));
            } catch (error) {
                console.log("Everything is fine  😊");
            }
        });
    }

    connectedCallback() {
        this.count = user.getCart()[this.itemId];
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
///////////   Cart page
class CartEntry extends HTMLElement {

    constructor(item, qty) {
        super();
        this.item = item;
        this.qty = qty;
    }

    connectedCallback() {
        // this.innerHTML = `
        //     <tr>
        //         <td class="item-id">2</td>
        //         <td class="item-name">Peri-Peri Drumsticks</td>
        //         <td class="item-price">$10</td>
        //         <td class="item-qty">2</td>
        //         <td>$20.00</td>
        //     </tr>
        // `
        this.updateDisplay();
    }

    updateDisplay() {
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

        // this.appendChild(tr);
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");   td1.setAttribute("class", "item-id");
        td1.innerHTML = `${this.item.id}`;
        const td2 = document.createElement("td");   td1.setAttribute("class", "item-name");
        td2.innerHTML = `${this.item.name}`;
        const td3 = document.createElement("td");   td1.setAttribute("class", "item-price");
        td3.innerHTML = `${this.item.price}`;
        const td4 = document.createElement("td");   td1.setAttribute("class", "item-qty");
        td4.innerHTML = `${this.qty}`;
        const td5 = document.createElement("td");
        td5.innerHTML = `${this.qty * this.item.price}`;

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);

        this.appendChild(tr);  // Append the <tr> to the custom element itself
    }
}   