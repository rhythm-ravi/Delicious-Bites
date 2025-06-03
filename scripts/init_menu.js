// const req = require( "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" );
// import "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";
function renderMenu() {
    $(document).ready(function() {
        // console.log("halo");
        $.ajax({
            method: 'POST',
            url: 'php/helper.php',
            dataType: 'JSON',
            success: function(response) {
                console.log(response);
                init_menu(response);
            },
            error: function(xhr, status, error) {
                console.log("Error occurred: " + status + ", " + error);
                console.log(xhr.responseText); // Check the response from the server
            }
        })

    })
}


function init_menu(records) {

    //////////////////////////////////////////////
    if (user.getUserId() != null) {         // logged in ig
        alert(`Welcome ${user.getUserName()}!`);
        console.log(user.getCart());
    }
    //////////////////////////////////////////////

    window.customElements.define('interact-btn', InteractButton);
    window.customElements.define('non-interact-btn', NonInteractButton);

    const grid = document.querySelector("#menu .grid");
    const template = document.querySelector("#menu-entry");

    // for each record fetched from db, add corresponging entry node in dom
    // records.forEach(record => {  
    for (let key in records) {  
        console.log(records);
        const record = records[key];
        // if item unavailable
        if (!record.availability)   
            continue;             // skips current iteration
        
        // item available 
        const clone = template.content.cloneNode(true);   
        
        // Populating the img child
        const img = clone.querySelector(".item-img");
        img.setAttribute("src", `../assets/img/menu/${record.id}-thumbnail.jpg`);
        img.setAttribute("alt", record.name);

        // setting  name and price 
        const details = clone.querySelector(".details");
        details.innerHTML = record.name + "<br>{$" + record.price + "}";

        let interactButton;
        if (user.getUserId())
            interactButton = new InteractButton(record.id);
        else
            interactButton = new NonInteractButton();
        // console.log(record.id);
        
        clone.querySelector(".menu-entry").appendChild(interactButton);
        grid.appendChild(clone);
    };
}