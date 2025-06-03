// const req = require( "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" );
// import "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";
function ajaxCall() {
    $(document).ready(function() {
        console.log("halo");
        $.ajax({
            method: 'POST',
            url: 'php/helper.php',
            dataType: 'JSON',
            success: function(response) {
                console.log(response);
                init_menu(response)
            },
            error: function(xhr, status, error) {
                console.log("Error occurred: " + status + ", " + error);
                console.log(xhr.responseText); // Check the response from the server
            }
        })

    })

}


function init_menu(records) {
    localStorage.setItem('menu', records);          // 
    let items;
    //////////////////////////////////////////////
    if (user.getUserId() != null) {         // logged in ig
        alert(`Welcome ${user.getUserName()}!`);
        console.log(user.getCart());

        items = user.getCart();

        console.log(system);
    }
    //////////////////////////////////////////////

    // window.customElements.define('modify-count', ModifyCount);
    // window.customElements.define('add-to-cart', AddToCart);
    window.customElements.define('interact-btn', InteractButton);

    const grid = document.querySelector("#menu .grid");
    const template = document.querySelector("#menu-entry");

    // for each record fetched from db, add corresponging entry node in dom
    records.forEach(record => {     
        // console.log(record);
        const clone = template.content.cloneNode(true);   
        
        // Populating the img child
        const img = clone.querySelector(".item-img");
        img.setAttribute("src", `../assets/img/menu/${record.id}-thumbnail.jpg`);
        img.setAttribute("alt", record.name);

        // setting  name and price 
        const details = clone.querySelector(".details");
        details.innerHTML = record.name + "<br>{$" + record.price + "}";

        let interactButtons = new InteractButton(record.id);
        // if ( user.getCart()[record.id] && user.getCart()[record.id] >= 0) {        // some positive integer
        //     interactButtons = new ModifyCount(record.id);
        //     // console.log(typeof(record.id));
        // } else {
        //     interactButtons = new AddToCart(record.id);
        // }
        
        clone.querySelector(".menu-entry").appendChild(interactButtons);
        grid.appendChild(clone);
    });
}