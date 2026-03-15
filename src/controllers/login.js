import finduserbymail from '../models/database.js';
import database from '../models/database.js';

let mailInput = document.getElementById("mail");
let passwordInput = document.getElementById("password");
let submitBtn = document.getElementById("submitbtn");

submitBtn.addEventListener("click", handlesubmit);

function handlesubmit(){
    const email = mailInput.value;
    const password = passwordInput.value;

    const user = finduserbymail(email, password);

    if (user){
        submitBtn.textContent = "Connecting..."

        if (!localStorage.getItem("allUsers")) {
            localStorage.setItem("allUsers", JSON.stringify(database.users));
        }

        localStorage.setItem("currentUser", JSON.stringify(user));

        setTimeout(()=>
            document.location.href = "dashboard.html"
            , 2000);

    }else {
        alert("Error : User not found !!!");
    }
}
