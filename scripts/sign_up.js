let errors = {
    strengthError: true,
    matchError: true,
};


function handleSignUp(event) {

    event.preventDefault();

    // requirements for valid form:  all fields filled, 
    // valid, passes match =>  1 T,  3  implemented here, 2  upon submit
    
    for (var key in errors) {
        const error = errors[key];
        if (error) {
            const submitButton = document.getElementById("submit-button");
            const errorAnimation = [
                { backgroundColor: "red"},
                // { color: "green"},
            ];
            const animationTiming = {
                duration: 150,
                iterations: 3,
            };
            submitButton.animate(errorAnimation, animationTiming);
            console.log("Password error");
            return;
            // submitButton.style.color = "red";
        }
    }
    // errors.forEach( (error) => {
    //     if (error) {
    //         const submitButton = document.getElementById("submit-button");
    //         const errorAnimation = [
    //             { color: "red"},
    //             // { color: "green"},
    //         ];
    //         const animationTiming = {
    //             duration: 3000,
    //             iterations: 3,
    //         };
    //         submitButton.animate(errorAnimation, animationTiming);
    //         console.log("Password error");
    //         return;
    //         // submitButton.style.color = "red";
    //     }
    // });
    const form = event.target;
    const formData = new FormData(form);

    fetch('php/sign_up.php', {
        method: 'POST', 
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        displayStatus(data);
    })
    .catch(error => {
        alert('Some sort of error:', error);
        console.error('Some sort of error:', error);
    });
}

function addListeners() {
    let username = document.getElementById("username");
    let mobile = document.getElementById("mobile-number");
    let email = document.getElementById("email-id");


    let password = document.getElementById("password");
    let confirmPassword = document.getElementById("confirm-password");
    password.addEventListener( 'input', function()  {
        pwdStrength(password.value);
    });
    password.addEventListener( 'input', matchPasswords);
    confirmPassword.addEventListener( 'input', matchPasswords );


}

function pwdStrength(password) {
    // let password = pass.value;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/;

    const strengthError = document.getElementById("strength-error");
    if ( strongPasswordRegex.test(password) || password=="") {
        strengthError.style.display = "none";
        console.log("Adequate password");
        if (password!="")
            errors.strengthError = false;
        else
            error.strengthError = true;
    } else {
        strengthError.style.display = "inline";
        console.log("Fuck You!");
        errors.strengthError = true;
    }

}
function matchPasswords() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const matchError = document.getElementById("match-error");
    if (password==confirmPassword || confirmPassword=="") {
        matchError.style.display = "none";
        console.log("samey");
        if (confirmPassword!="")
            errors.matchError = false;
        else
            errors.matchError = true;
    } else {
        matchError.style.display = "inline";
        console.log("different");
        errors.matchError = true;
    }
}
// ABCDef8@

function displayStatus(response) {
    const u = response.validName;
    const m = response.validMobile;
    const e = response.validEmail;
    const loginSuccess = response.success;
    console.log(u, m, e);

    let displayString;
    if (loginSuccess) {
        displayString = "Sign Up successful! Account Created!\n Login to continue";
    } else {
        const connectError = u && m && e;
        if (connectError) {
            displayString = "Unable to connect with server. Please try later.";
        } else {
            displayString = `${!u ? 'Username already in use.\n' : ''}${!m ? 'Mobile number already in use.\n' : ''}${!e ? 'Email already in use.\n' : ''}Please try again.`;
        }
    }
    alert(displayString);
}