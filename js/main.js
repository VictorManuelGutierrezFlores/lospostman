/// CONVERSION A HEADERS
function enviar() {
    var usuario = document.getElementById("username");
    var contraseña = document.getElementById("password");

    var base64 = btoa(usuario + ":" + contraseña);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost/serviciosweb/lospostman/autenticacion", true);
    xhr.setRequestHeader("Authorization", "Basic " + base64);

    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("Login correcto");
        } else {
            alert("Login incorrecto");
        }
    };

    xhr.send();
}


$(document).ready(function () {
    $('#loginButton').click(function () {
        var username = $('#username').val();
        var password = $('#password').val();

        $.ajax({
            url: 'api/login',
            method: 'POST',
            dataType: 'json',
            data: {
                username: username,
                password: password
            },
            success: function (data) {
                if (data.success) {
                    alert('Login successful!');
                    window.location.href = '/';
                } else {
                    alert('Login failed.');
                }
            },
            error: function (error) {
                console.error('Error:', error);
            }
        });
    });
});