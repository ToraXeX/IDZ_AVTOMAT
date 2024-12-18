document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Здесь можно добавить логику авторизации на сервере
    alert(`Вход выполнен для ${email}`);
});
