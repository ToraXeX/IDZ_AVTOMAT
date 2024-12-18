document.getElementById("register-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Здесь можно добавить логику отправки данных на сервер
    alert(`Регистрация прошла успешно для ${name}`);
});
