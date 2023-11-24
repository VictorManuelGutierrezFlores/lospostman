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

/// LOGIN FORM
$(document).ready(function () {
    $('#loginButton').click(function (e) {
        $.ajax({
            url: "http://localhost/serviciosweb/lospostman/autenticacion",
            method: 'POST',
            headers: {
                "user": $('#username').val(), // Envio de credenciales por HEADERS
                "pass": $('#password').val()
            },
            success: function (data) {
                // Redireccion a Dashboard por status
                if (data.status == "Success") {
                    // GUARDANDO CREDENCIALES 
                    localStorage.setItem("user", $('#username').val());
                    localStorage.setItem("pass", $('#password').val());
                    alert('Login successful!');
                    window.location.href = 'http://localhost/serviciosweb/lospostman/dashboard.html';
                } else {
                    alert("Login failed!");
                }
            }
        });
        // Prevencion de recarga de pagina
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
            url: "http://localhost/serviciosweb/lospostman/producto/",
            method: 'POST',
            headers: {
                "user" : localStorage.getItem('user'),
                'pass' : localStorage.getItem('pass')
            },
            data : JSONData,
            success: function (data){
                if(data.status == "Success"){
                    alert("Insercion exitosa");
                    window.location.href = 'http://localhost/serviciosweb/lospostman/dashboard.html';
                    console.log(data);
                }else{
                    alert("Insercion fallida");
                    console.log(data);
                }
            }
        });
        e.preventDefault();
    });
});
