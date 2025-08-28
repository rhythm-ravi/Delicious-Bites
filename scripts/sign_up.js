// Error state for each field.
let errors = {
    firstNameError: true,
    lastNameError: false, // No check, so always false
    usernameError: true,
    mobileError: true,
    emailError: true,
    strengthError: true,
    matchError: false
};

window.addEventListener('DOMContentLoaded', addListeners);

function addListeners() {
    document.getElementById("first-name").addEventListener('input', validateFirstName);
    document.getElementById("last-name").addEventListener('input', validateLastName);
    document.getElementById("username").addEventListener('input', validateUsername);
    document.getElementById("mobile-number").addEventListener('input', validateMobile);
    document.getElementById("email").addEventListener('input', validateEmail);

    let password = document.getElementById("password");
    let confirmPassword = document.getElementById("confirm-password");
    password.addEventListener('input', validatePasswordStrength);
    password.addEventListener('input', matchPasswords);
    confirmPassword.addEventListener('input', matchPasswords);

    // Check validity on every field change
    for (let id of ["first-name","last-name","username","mobile-number","email","password","confirm-password"]) {
        document.getElementById(id).addEventListener('input', checkFormValidity);
    }
}

function validateFirstName() {
    const input = document.getElementById("first-name");
    const error = document.getElementById("first-name-error");
    if (input.value.trim() === "") {        // Only check if name empty or not
        errors.firstNameError = true;
        input.classList.remove("valid");
        if (input.value != "")  {
            error.textContent = "First name cannot be empty.";
            error.style.display = "inline";
            input.classList.add("invalid");
        } else {    // else empty input, so no visual error
            error.style.display = "none";
            input.classList.remove("invalid");
        }
    } else {
        errors.firstNameError = false;
        error.style.display = "none";
        input.classList.remove("invalid");
        input.classList.add("valid");
        // input.value = input.value.trim();  // Trim whitespace
    }
}

// Last name is optional, allow anything, so always valid
function validateLastName() {
    // const input = document.getElementById("last-name");
    // const error = document.getElementById("last-name-error");
    // error.style.display = "none";
    // input.classList.remove("invalid");
    // input.classList.add("valid");
    // errors.lastNameError = false;
}

function validateUsername() {
    const input = document.getElementById("username");
    const error = document.getElementById("username-error");
    const re = /^[A-Za-z][a-zA-Z0-9_]{2,14}$/;
    if (re.test(input.value)) {
        errors.usernameError = false;
        error.style.display = "none";
        input.classList.remove("invalid");
        input.classList.add("valid");
    } else {
        errors.usernameError = true;
        input.classList.remove("valid");
        if (input.value != "") {    // Only show error if input is not empty
            error.textContent = "Username must start with a letter, be 3-15 chars, and contain no special characters except _";
            error.style.display = "inline";
            input.classList.add("invalid");
        } else {    // Empty input, so no visual error
            error.style.display = "none";
            input.classList.remove("invalid");}
    }
}

function validateMobile() {
    const input = document.getElementById("mobile-number");
    const error = document.getElementById("mobile-error");
    const re = /^[0-9]{10}$/;
    if (re.test(input.value)) {
        errors.mobileError = false;
        error.style.display = "none";
        input.classList.remove("invalid");
        input.classList.add("valid");
    } else {
        errors.mobileError = true;
        input.classList.remove("valid");
        if (input.value != "") {    // Only show error if input is not empty
            error.textContent = "Mobile number must be exactly 10 digits.";
            error.style.display = "inline";
            input.classList.add("invalid");
        } else {    // Empty input, so no visual error
            error.style.display = "none";  
            input.classList.remove("invalid");
        }
    }
}

function validateEmail() {
    const input = document.getElementById("email");
    const error = document.getElementById("email-error");
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (re.test(input.value)) {
        errors.emailError = false;
        error.style.display = "none";
        input.classList.remove("invalid");
        input.classList.add("valid");
    } else {
        errors.emailError = true;
        input.classList.remove("valid");
        if (input.value != "") {    // Only show error if input is not empty
            error.textContent = "Invalid email address.";
            error.style.display = "inline";
            input.classList.add("invalid");
        } else {    // Empty input, so no visual error
            error.style.display = "none";  
            input.classList.remove("invalid");
        }
    }
}

// Password strength
function validatePasswordStrength() {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/;
    const input = document.getElementById("password");
    const error = document.getElementById("strength-error");

    const password = input.value;

    if ( strongPasswordRegex.test(password) ) {
        errors.strengthError = false;
        error.style.display = "none";
        input.classList.remove("invalid");
        input.classList.add("valid");
    } else {
        errors.strengthError = true;
        input.classList.remove("valid");
        if (password != "") {    // Only show error if input is not empty
            error.textContent = "Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character.";
            error.style.display = "inline";
            input.classList.add("invalid");
        } else {    // else empty input, so no visual error
            error.style.display = "none";
            input.classList.remove("invalid");
        }
    }

}

// Password match (already implemented)
function matchPasswords() {

    const passwordEle = document.getElementById("password");
    const confirmPasswordEle = document.getElementById("confirm-password");
    const error = document.getElementById("match-error");
    if ( passwordEle.value === confirmPasswordEle.value ) {
        errors.matchError = false;
        error.style.display = "none";
        confirmPasswordEle.classList.remove("invalid");
        if ( !errors.strengthError ) {  // Only green if password strong too
            confirmPasswordEle.classList.add("valid");
        } else {
            confirmPasswordEle.classList.remove("valid");
        }
    } else {
        errors.matchError = true;
        confirmPasswordEle.classList.remove("valid");
        if (confirmPasswordEle.value != "") {    // Only show error if input is not empty
            error.textContent = "Passwords do not match.";
            error.style.display = "inline";
            confirmPasswordEle.classList.add("invalid");
        } else {    // else empty input, so no visual error
            error.style.display = "none";
            confirmPasswordEle.classList.remove("invalid");
        }
    }

    // console.log(confirmPasswordEle.classList);
}

// Disable submit if any error
function checkFormValidity() {
    const submitButton = document.getElementById("submit-button");
    const allValid = Object.values(errors).every(val => val === false);
    submitButton.disabled = !allValid;
}


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

    const form = event.target;
    const formData = new FormData(form);

    fetch('php/sign_up.php', {
        method: 'POST', 
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        // displayStatus(data);
        if (data.success) {
            alert("Sign Up successful! Account Created!\n Login to continue");
            window.location.href = "login.html";  // Redirect to login page
        } else {
            if (data.errors.at(-1).startsWith("Duplicate field:")) {    // check if only errors are the dup ones

                for (let i=0; i<data.errors.length; i++) {
                    data.errors[i] = data.errors[i].substring("Duplicate field: ".length);
                }
                let errorMessage = data.errors.join('\n');
                alert(errorMessage);
            } else {        // we have some other error,  which should tbe displayed even if any dup errors
                alert(data.errors.at(-1));
            }
        }
    })
    .catch(error => {
        console.error('Could not connect to server: ', error);  
        // Error in connecting to server or maybe error in server script's catch / finally block (obv not a real concern)
    });
}


// ABCDef8@


// function displayStatus(response) {
//     const u = response.validName;
//     const m = response.validMobile;
//     const e = response.validEmail;
//     const loginSuccess = response.success;
//     console.log(u, m, e);

//     let displayString;
//     if (loginSuccess) {
//         displayString = "Sign Up successful! Account Created!\n Login to continue";
//     } else {
//         const connectError = u && m && e;
//         if (connectError) {
//             displayString = "Unable to connect with server. Please try later.";
//         } else {
//             displayString = `${!u ? 'Username already in use.\n' : ''}${!m ? 'Mobile number already in use.\n' : ''}${!e ? 'Email already in use.\n' : ''}Please try again.`;
//         }
//     }
//     alert(displayString);
// }

// function addListeners() {
//     let username = document.getElementById("username");
//     let mobile = document.getElementById("mobile-number");
//     let email = document.getElementById("email-id");


//     let password = document.getElementById("password");
//     let confirmPassword = document.getElementById("confirm-password");
//     password.addEventListener( 'input', function()  {
//         pwdStrength(password.value);
//     });
//     password.addEventListener( 'input', matchPasswords);
//     confirmPassword.addEventListener( 'input', matchPasswords );


// }