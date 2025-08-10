// const req = require( "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" );
// import "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";

async function renderMenu() {
    if (user.getUserId()) {         // fetch cart before rendering menu
        console.log("Fetching cart");   
        await user.fetchCart();  // Fetches cart data from server and stores it in local storage
    }
    
    await platform.getMenu();  // Fetches menu data from server and stores it in local storage
    console.log(localStorage.getItem('menu'));  // DEBUG: Check if menu is stored in local storage
    const menu = JSON.parse(localStorage.getItem('menu'));  // Retrieve menu from local storage
    if (!menu) {        // couldn't connect to db and no cached menu
        console.error("Couldn't connect to db and no cached menu");
        return;
    }       

    // Rendering the menu using the fetched data
    console.log("Rendering menu with data:", menu);      // DEBUG
    window.customElements.define('item-interact', MenuItemInteract);

    const grid = document.querySelector("#menu .grid");
    const template = document.querySelector("#menu-entry");

    // for each record fetched from db, add corresponging entry node in dom
    // menu.forEach(record => {  
    for (let key in menu) {  
        const record = menu[key];
        // if item unavailable
        if (!record.availability)   
            continue;             // skips current iteration
        
        // item available 
        const clone = template.content.cloneNode(true);   
        
        console.log("Adding item:", record.name, "with ID:", record.id);  // DEBUG
        // Populating the img child
        const img = clone.querySelector(".item-img");
        img.setAttribute("src", `../assets/img/menu/${record.id}-thumbnail.jpg`);
        img.setAttribute("alt", record.name);

        // setting  name and price 
        const details = clone.querySelector(".details");
        details.innerHTML = record.name + "<br>{$" + record.price + "}";

        let interactButton = new MenuItemInteract(record.id);
        console.log(interactButton);
        clone.querySelector(".menu-entry").appendChild(interactButton);
        grid.appendChild(clone);
    };

}

// function init_menu(menu) {

//     window.customElements.define('item-interact', MenuItemInteract);

//     const grid = document.querySelector("#menu .grid");
//     const template = document.querySelector("#menu-entry");

//     // for each record fetched from db, add corresponging entry node in dom
//     // menu.forEach(record => {  
//     for (let key in menu) {  
//         const record = menu[key];
//         // if item unavailable
//         if (!record.availability)   
//             continue;             // skips current iteration
        
//         // item available 
//         const clone = template.content.cloneNode(true);   
        
//         console.log("Adding item:", record.name, "with ID:", record.id);  // DEBUG
//         // Populating the img child
//         const img = clone.querySelector(".item-img");
//         img.setAttribute("src", `../assets/img/menu/${record.id}-thumbnail.jpg`);
//         img.setAttribute("alt", record.name);

//         // setting  name and price 
//         const details = clone.querySelector(".details");
//         details.innerHTML = record.name + "<br>{$" + record.price + "}";

//         let interactButton = new MenuItemInteract(record.id);
//         console.log(interactButton);
//         clone.querySelector(".menu-entry").appendChild(interactButton);
//         grid.appendChild(clone);
//     };
// }