let dummyUser = {
    email: "suhani2563.beai25@chitkara.edu.in",
    password: "123456"
};

function login(){
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let message = document.getElementById("loginMessage");

    if(!email || !password){
        message.innerText = "Enter both email and password!";
        return;
    }
    if(email === dummyUser.email && password === dummyUser.password){
        message.style.color = "green";
        message.innerText = "Login successful! Redirecting...";
        setTimeout(() => {
            window.location.href = "start.html"; 
        }, 1000);
    } else {
        message.style.color = "red";
        message.innerText = "Invalid email or password!";
    }
}

function forgotPassword(){
    let email = prompt("Enter your email to reset password:");
    if(email){
        alert("Password reset link sent to " + email);
    }
}