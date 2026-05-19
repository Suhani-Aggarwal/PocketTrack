document.getElementById("signupForm").addEventListener("submit", function(e){
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const age = document.getElementById("age").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let message = document.getElementById("signupMessage");

    if(name === "" || email === "" || phone === "" || age === "" || password === "" || confirmPassword === ""){
        alert("Please fill all fields!");
        e.preventDefault();
        return;
    }

    if(!email.includes("@")){
        alert("Enter valid email");
        e.preventDefault();
        return;
    }

    let phonePattern = /^[0-9]{10}$/;
    if(!phonePattern.test(phone)){
        alert("Enter valid 10-digit phone number");
        e.preventDefault();
        return;
    }

    if(age < 1){
        alert("Enter valid age");
        e.preventDefault();
        return;
    }

    let passwordPattern = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if(!passwordPattern.test(password)){
        alert("Password must be at least 6 characters long, contain 1 uppercase letter and 1 number");
        e.preventDefault();
        return;
    }

    if(password !== confirmPassword){
        alert("Passwords do not match!");
        e.preventDefault();
        return;
    }

    e.preventDefault();

    message.style.color = "green";
    message.innerText = "Signup successful! Redirecting to login...";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
});