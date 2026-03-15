let loginbtn = document.getElementById("Loginbtn");

loginbtn.addEventListener("click", handlebtn);

function handlebtn(){
    loginbtn.textContent = "Loading..."
    setTimeout(()=>
        document.location.href = "login.html"
        ,2000);
}