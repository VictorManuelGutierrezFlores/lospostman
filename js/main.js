// FUNCION: CREAR JSON DE DATOS DE FORMULARIO
function crearJSON() {
    // OBTIENE DATOS DE FORMULARIO
    var datosFormulario = $('#Formulario').serialize();
    // CONVIERTE DATOS EN JSON
    var datosJSON = JSON.stringify(datosFormulario);
    var json = JSON.parse(datosJSON)
    //DEVUELVE JSON
    return json;
}
// FUNCION: VERIFICAR EMAIL
function verifyEmail(email) {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+)@(([a-zA-Z0-9-]+\.)+)[a-zA-Z]{2,})$/;
    return regex.test(email)
}

// FUNCION: VERIFICAR CONTRASEÑA SEGURA
function verifyPassword(password) {
    // Requerimiento minimos
    var length = password.length;
    var hasUpperCase = /[A-Z]/.test(password);
    var hasLowerCase = /[a-z]/.test(password);
    var hasNumber = /[0-9]/.test(password);

    return length >= 8 && hasLowerCase && hasUpperCase && hasNumber;
}




/// SIGNIN FORM
$(document).ready(function () {
    $('#signinButton').click(function (e) {
        var email = $('#email').val();
        var password = $('#password').val();
        if (verifyEmail(email) && verifyPassword(password)) {
            $.ajax({
                url: "NOMBRE DE LA RUTA DE SIGNIN",
                method: 'POST',
                headers: {
                    "user": $('#username').val(), // Envio de credenciales por HEADERS
                    "pass": password,
                    "email": email,
                    "disable": False
                },
                success: function (data) {
                    if (data.success) {
                    // GUARDANDO CREDENCIALES 
                        localStorage.setItem("user", $('#username').val());
                        localStorage.setItem("pass", $('#password').val());
                        alert('Sign In successful!');
                        window.location.href = 'http://localhost/ServiciosWeb/ProyectoFinalV1/Slim/dashboard.html';
                    } else {
                        alert("Sign In failed!!")
                        console.log(data)
                    }

                } 
            });
            e.preventDefault();
        } else {
            alert("Verifica tus datos!!")
        }
    });
});

// LOGOUT
// Función para cerrar sesión
function logout() {
    // Elimina el token del almacenamiento local
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Puedes redirigir al usuario a la página de inicio u otra página después del cierre de sesión
    window.location.href = 'http://localhost/ServiciosWeb/ProyectoFinalV1/Slim/login.html';
}

// Evento clic en el botón de cerrar sesión
$(document).ready(function () {
    $('#logoutButton').click(function (e) {
        // Llama a la función de cerrar sesión al hacer clic en el botón
        logout();
        e.preventDefault();
    });
});

$(document).ready(function () {
    var permiteAcceso = false;

    $('#loginButton').click(function (e) {
        $.ajax({
            url: "http://localhost/ServiciosWeb/ProyectoFinalV1/Slim/autenticacion",
            method: 'POST',
            headers: {
                "user": $('#username').val(),
                "pass": $('#password').val()
            },
            success: function (data) {
                if (data.status == "Success") {
                    localStorage.setItem("user", $('#username').val());
                    localStorage.setItem("pass", $('#password').val());

                    // Verificar permiteAcceso después de una verificación exitosa
                    permiteAcceso = data.permiteAcceso;

                    if (permiteAcceso) {
                        alert('Puede acceder. El proyecto C# está en ejecución.');
                    } else {
                        permiteAcceso = false;
                        alert('No puede acceder. Espere a que se inicie el proyecto C#.');
                    }
                    alert('Login successful!');
                    window.location.href = 'http://localhost/ServiciosWeb/ProyectoFinalV1/Slim/dashboard.html';
                } else {
                    permiteAcceso = false;
                    alert("Login failed!");
                }
            }
        });

        e.preventDefault();
    });
});



// ADD PRODUCT
$(document).ready(function () {
    console.log("Ready!");
    $('#addButton').click(function (e) {
        var JSONData = crearJSON();
        console.log(JSONData);
        // convierte una cadena JSON en un objeto JavaScript.
        dataPars = JSON.parse(JSONData);
        $.ajax({
            url: "http://localhost/ServiciosWeb/ProyectoFinalV1/Slim/producto/",
            method: 'POST',
            headers: {
                "user": localStorage.getItem('user'),
                'pass': localStorage.getItem('pass')
            },
            data: JSONData,
            success: function (data) {
                if (data.status == "Success") {
                    alert("Insercion exitosa");
                    window.location.href = 'http://localhost/ServiciosWeb/ProyectoFinalV1/Slim/dashboard.html';
                    console.log(data);
                } else {
                    alert("Insercion fallida");
                    console.log(data);
                }
            }
        });
        e.preventDefault();
    });
});