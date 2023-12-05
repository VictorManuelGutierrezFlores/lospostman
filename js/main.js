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
                        window.location.href = 'http://localhost/serviciosweb/lospostman/dashboard.html';
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
    
    $('#addButton').click(function (e) {
        var id = $('#Categoria').val();
        console.log(id);
        var url = 'http://localhost/serviciosweb/lospostman/producto/'+id;
        //var JSONData = crearJSON();
       // console.log(JSONData);
        // convierte una cadena JSON en un objeto JavaScript.
        //dataPars = JSON.stringify(JSONData);
        
        
       

        // Construir el objeto de datos
        var JSONData = {
                ISBN:$("#ISBN").val(),
                Autor: $("#Autor").val(),
                Descuento: $("#Descuento").val(),
                Editorial: $("#Editorial").val(),
                Fecha: $("#Fecha").val(),
                Nombre: $("#Nombre").val(),
                Precio: $("#Precio").val()
            
        };
        $.ajax({
            url: url,
            type: 'POST',
            headers: {
                 "user": localStorage.getItem('user'),
                'pass': localStorage.getItem('pass')
            },
            dataType: 'json',
           // contentType: "application/json",
            data: JSON.stringify(JSONData),
            success: function(response) {
                // Manejar la respuesta del servidor.
                if (response.status === 'Success') {
                    alert("Insercion exitosa");
                    window.location.href = 'http://localhost/serviciosweb/lospostman/dashboard.html';
                    console.log(response.data);
                    $('#respServer').text(response.message);
                // Puedes hacer lo que necesites con los datos en 'response.data'.
                }},
            error: function(error) {
                // Manejar errores.
                dat=error.responseJSON;
                alert('El producto ya existe');
                console.error(dat.message);
                
                $('#respServer').text(dat.message);
            }
            });
        e.preventDefault();
    });
});


// PUT PRODUCT
$(document).ready(function () {
    
    $('#putButton').click(function (e) {
        var id = $('#ISBN').val();
        console.log(id);
        var link = 'http://localhost/serviciosweb/lospostman/productos/detalles/'+id;
        // Construir el objeto de datos
        var JSONData = {
                ISBN:$("#ISBN").val(),
                Autor: $("#Autor").val(),
                Descuento: $("#Descuento").val(),
                Editorial: $("#Editorial").val(),
                Fecha: $("#Fecha").val(),
                Nombre: $("#Nombre").val(),
                Precio: $("#Precio").val()
            
        };
        $.ajax({
            type: "PUT",
            url: link,
            //contentType: "application/json; charset=utf-8",
            headers: {
                 "user": localStorage.getItem('user'),
                'pass': localStorage.getItem('pass')
            },
            data: JSON.stringify(JSONData),
            success: function(response) {
                // Manejar la respuesta del servidor.
                if (response.status === 'Success') {
                    alert("Actualizacion exitosa");
                    window.location.href = 'http://localhost/serviciosweb/lospostman/dashboard.html';
                    console.log(response.data);
                    $('#respServer').text(response.message);
                // Puedes hacer lo que necesites con los datos en 'response.data'.
                }},
            error: function(error) {
                // Manejar errores.
                dat=error.responseJSON;
                alert('Producto no encontrado');
                console.error(dat.message);
                
                $('#respServer').text(dat.message);
            }
            });
        e.preventDefault();
    });
});



// GET PRODUCT

$(document).ready(function () {
    $('#getButton').click(function (e) {
        var id = $('#ISBN').val();
        var url = 'http://localhost/serviciosweb/lospostman/detalles/'+id;

        // Ejemplo de AJAX en JavaScript usando jQuery.

            $.ajax({
            url: url, // Asegúrate de ajustar la URL según tu configuración
            method: 'GET',
            headers: {
                 "user": localStorage.getItem('user'),
                'pass': localStorage.getItem('pass')
            },
            dataType: 'json',
            success: function(response) {
                // Manejar la respuesta del servidor.
                if (response.status === 'Success') {
                    alert("Obtencion exitosa");
                    console.log(response.data);
                var datos = response.data;
                var respAutor='Autor: ' + datos.Autor ;
                var respNombre='Nombre: ' + datos.Nombre ;
                var respEditorial='Editorial: ' + datos.Editorial ;
                var respFecha='Fecha: ' + datos.Fecha ;
               
                var respPrecio='Precio: ' + datos.Precio ;
                var respDescuento='Descuento: ' + datos.Descuento ;
                $('#respNombre').text(respNombre);
                $('#respAutor').text(respAutor);
                $('#respEditorial').text(respEditorial);
                $('#respFecha').text(respFecha);
               
                $('#respPrecio').text(respPrecio);
                $('#respDescuento').text(respDescuento);
                // Puedes hacer lo que necesites con los datos en 'response.data'.
                } 
            },
            error: function(error) {
                // Manejar errores.
                dat=error.responseJSON;
                alert('Producto no encontrado');
                console.error(dat.message);
                $('#respNombre').text(dat.message);
                    $('#respAutor').text("");
                    $('#respEditorial').text("");
                    $('#respFecha').text("");
                    $('#respISBN').text("");
                    $('#respPrecio').text("");
                    $('#respDescuento').text("");
            }
            });

        e.preventDefault();
    });
});


//Delete product


$(document).ready(function () {
    $('#delButton').click(function (e) {
        var id = $('#ISBN').val();
        var url = 'http://localhost/serviciosweb/lospostman/productos/'+id;

        // Ejemplo de AJAX en JavaScript usando jQuery.

            $.ajax({
            url: url, // Asegúrate de ajustar la URL según tu configuración
            type: 'DELETE',
            headers: {
                 "user": localStorage.getItem('user'),
                'pass': localStorage.getItem('pass')
            },
            
            success: function(response) {
                // Manejar la respuesta del servidor.
                if (response.status === 'Success') {
                    alert("Eliminacion exitosa");
                    window.location.href = 'http://localhost/serviciosweb/lospostman/dashboard.html';
                    console.log(response.data);
                    $('#respServer').text(response.message);
                // Puedes hacer lo que necesites con los datos en 'response.data'.
                }
            },
            error: function(error) {
                // Manejar errores.
                dat=error.responseJSON;
                alert('Producto no encontrado');
                console.error(dat.message);
                
                $('#respServer').text(dat.message);
            }
            });

        e.preventDefault();
    });
});




