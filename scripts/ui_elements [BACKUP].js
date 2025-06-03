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
        if (this.count > 0) {
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
            // const plusButton = this.querySelector(".plus-item");
            // const minusButton = this.querySelector(".minus-item");
            // if (plusButton || minusButton) {
            //     if (plusButton) plusButton.addEventListener('click', this.incrementCount.bind(this));
            //     if (minusButton) minusButton.addEventListener('click', this.decrementCount.bind(this));
            // } else {
            //     console.error('Buttons not found!');
            }
        );
    }


    connectedCallback() {
        this.count = user.getCart()[this.itemId];
        this.updateDisplay();
        // if (this.count) {       // +ve int
        //     this.innerHTML  = `
        //     <span class="alter-cnt">
        //         <span class="item-qty">${this.count}</span>
        //             <button class="item-btn plus-item" type="button">
        //                 +
        //             </button>
        //             <button class="item-btn minus-item" type="button">
        //                 -
        //             </button>
        //     </span>
        //     `;
        //     requestAnimationFrame(() => {
        //         const plusButton = this.querySelector(".plus-item");
        //         const minusButton = this.querySelector(".minus-item");
    
        //         if (plusButton && minusButton) {
        //             // alert("Eventlisteners should be added!");
        //             // binding this to the custom ele  rather than the button nested within, use bind()
        //             plusButton.addEventListener('click', this.incrementCount.bind(this));
        //             minusButton.addEventListener('click', this.decrementCount.bind(this));
        //         } else {
        //             console.error('Buttons not found!');
        //         }
        //     });
        // } else {        // falsy value ie 0/undefined/null
        //     this.innerHTML = `
        //     <span>
        //         <button class="item-btn plus-item" type="button">
        //             Add To Cart
        //         </button>
        //     </span>
        //     `;
        //     requestAnimationFrame(() => {
        //         const plusButton = this.querySelector(".plus-item");
        //         if (plusButton) {
        //             // bind to this item element
        //             plusButton.addEventListener('click', this.incrementCount.bind(this));
        //         } else {
        //             console.error('Button not found!');
        //         }
        //     });
    }
}


class ModifyCount extends InteractButton {
    static observedAttributes = ["color", "size"];

    constructor( itemId ) {
      // Always call super first in constructor
      console.log(itemId);
      super(itemId);
    }
    connectedCallback() {
    //   const shadowRoot = this.attachShadow({ mode: "open" });
      this.count = user.getCart()[this.itemId];
      this.innerHTML = `
        <span class="alter-cnt">
            <span class="item-qty">${this.count}</span>
            <button class="item-btn plus-item" type="button">
                +
            </button>
            <button class="item-btn minus-item" type="button">
                -
            </button>
        </span>
    `;

        // delay below code until DOM is rendered
        // Ensure DOM is fully updated and elements exist
        requestAnimationFrame(() => {
            const plusButton = this.querySelector(".plus-item");
            const minusButton = this.querySelector(".minus-item");

            if (plusButton && minusButton) {
                // alert("Eventlisteners should be added!");
                // binding this to the custom ele  rather than the button nested within, use bind()
                plusButton.addEventListener('click', this.incrementCount.bind(this));
                minusButton.addEventListener('click', this.decrementCount.bind(this));
            } else {
                console.error('Buttons not found!');
            }
        });

    }

}

class AddToCart extends InteractButton {
    constructor(itemId) {
        super(itemId);
    }

    connectedCallback() {
        this.innerHTML =    `
            <span>
            <button class="item-btn plus-item" type="button">
                Add To Cart
            </button>
            </span>
        `;
        requestAnimationFrame(() => {
            const plusButton = this.querySelector(".plus-item");
            if (plusButton) {
                // bind to this item element
                plusButton.addEventListener('click', this.incrementCount.bind(this));
            } else {
                console.error('Button not found!');
            }
        });    }
}

///////////   Cart page
class CartEntry extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <tr>
                <td class="item-id">2</td>
                <td class="item-name">Peri-Peri Drumsticks</td>
                <td class="item-price">$10</td>
                <td class="item-qty">2</td>
                <td>$20.00</td>
            </tr>
        `
    }
}   