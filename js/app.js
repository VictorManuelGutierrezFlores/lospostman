// JSON BASE A MOSTRAR EN FORMULARIO
var baseJSON = {
    "precio": 0.0,
    "unidades": 1,
    "modelo": "XX-000",
    "marca": "NA",
    "detalles": "NA",
    "imagen": "img/default.png"
};

function init() {
    /**
     * Convierte el JSON a string para poder mostrarlo
     * ver: https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/JSON
     */
    var JsonString = JSON.stringify(baseJSON, null, 2);
    document.getElementById("description").value = JsonString;

    // SE LISTAN TODOS LOS PRODUCTOS
    listarProductos();
    buscarProducto();
    eliminarProducto();
}

// FUNCIÓN CALLBACK AL CARGAR LA PÁGINA O AL AGREGAR UN PRODUCTO
function listarProductos() {
    $('document').ready(function () {
        $.ajax({
            url: './backend/product-list.php',
            type: 'GET',
            success: function (response) {
                let productos = JSON.parse(response);
                let template = '';

                productos.forEach(producto => {
                    let descripcion = '';
                    descripcion += '<li>precio: ' + producto.precio + '</li>';
                    descripcion += '<li>unidades: ' + producto.unidades + '</li>';
                    descripcion += '<li>modelo: ' + producto.modelo + '</li>';
                    descripcion += '<li>marca: ' + producto.marca + '</li>';
                    descripcion += '<li>detalles: ' + producto.detalles + '</li>';

                    template += `
                        <tr productId="${producto.id}">
                            <td>${producto.id}</td>
                            <td>${producto.nombre}</td>
                            <td><ul>${descripcion}</ul></td>
                            <td>
                                <button class="product-delete btn btn-danger">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `;
                });
                $('#products').html(template);
            }
        });
    });
}

// FUNCIÓN CALLBACK DE BOTÓN "Buscar"
function buscarProducto(e) {
    $('document').ready(function () {
        $('#product-result').hide();

        $('#search').keyup(function (e) {
            if ($('#search').val()) {
                let search = $('#search').val();
                $.ajax({
                    url: './backend/product-search.php',
                    type: 'POST',
                    data: { search },// abreviatura de: data: {search: search},
                    success: function (response) {
                        let productos = JSON.parse(response);
                        let template = '';
                        let template_bar = '';

                        productos.forEach(producto => {
                            let descripcion = '';
                            descripcion += '<li>precio: ' + producto.precio + '</li>';
                            descripcion += '<li>unidades: ' + producto.unidades + '</li>';
                            descripcion += '<li>modelo: ' + producto.modelo + '</li>';
                            descripcion += '<li>marca: ' + producto.marca + '</li>';
                            descripcion += '<li>detalles: ' + producto.detalles + '</li>';

                            template += `
                                <tr productId="${producto.id}">
                                    <td>${producto.id}</td>
                                    <td>${producto.nombre}</td>
                                    <td><ul>${descripcion}</ul></td>
                                    <td>
                                        <button class="product-delete btn btn-danger">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                        `;
                            template_bar += `
                            <li>${producto.nombre}</il>
                        `;
                        });
                        $('#products').html(template);
                        $('#container').html(template_bar);
                        $('#product-result').show();
                    }
                });
            }
        });
    });
}

// FUNCIÓN CALLBACK DE BOTÓN "Agregar Producto"
function agregarProducto(e) {
    $(document).on('click', '.product-add', function () {
        // SE OBTIENE DESDE EL FORMULARIO EL JSON A ENVIAR
        var productoJsonString = $('#description').val();
        // SE CONVIERTE EL JSON DE STRING A OBJETO
        var finalJSON = JSON.parse(productoJsonString);
        // SE AGREGA AL JSON EL NOMBRE DEL PRODUCTO
        finalJSON['nombre'] = $('#name').val();

        //Validamos el formulario
        if (finalJSON['nombre'] == '') {//El nombre no puede estar vacío
            alert('[CLIENTE]: Error, el nombre no puede estar vacío');
        } else if (finalJSON['marca'] == '') {//La marca no puede estar vacía
            alert('[CLIENTE]: Error, la marca no puede estar vacía');
        } else if (finalJSON['modelo'] == '' || finalJSON['modelo'].length > 25) {//La marca no puede estar vacía y tener máximo 25 caracteres
            alert('[CLIENTE]: Error en el modelo');
        } else if (finalJSON['precio'] == '' || finalJSON['precio'] <= 99.99) {//El precio debe ser requerido y tener mínimo 99.99
            alert('[CLIENTE]: Error, el precio debe ser mayor a $99.99');
        } else if (finalJSON['detalles'].length > 250) {//Los detalles son opcionales y de haber son máximo 250 caracteres
            alert('[CLIENTE]: Los detalles no deben exceder los 250 caracteres');
        } else if (finalJSON['unidades'] < 0) {//Las unidades deben ser requridas y mayor o igual a cero
            alert('[CLIENTE]: Las unidades deben ser mayor o igual a cero');
        } else if (finalJSON['imagen'] == '') {
            finalJSON['imagen'] = 'img/default.png';
        } else {
            // SE OBTIENE EL STRING DEL JSON FINAL
            productoJsonString = JSON.stringify(finalJSON, null, 2);
            console.log(productoJsonString);
            $.post('./backend/product-add.php', { datos: productoJsonString }, function (response) {
                let respuesta = JSON.parse(response);
                let template_bar = '';
                template_bar += `
                            <li style="list-style: none;">status: ${respuesta.status}</li>
                            <li style="list-style: none;">message: ${respuesta.message}</li>
                        `;
                $('#container').html(template_bar);
                $('#product-result').show();
                listarProductos();

            });
        }
    });
}

// FUNCIÓN CALLBACK DE BOTÓN "Eliminar"
function eliminarProducto() {
    $(document).on('click', '.product-delete', function () {
        if (confirm("De verdad deseas eliminar el Producto")) {
            let element = $(this)[0].parentElement.parentElement;
            let id = $(element).attr('productId');
            console.log(id);
            $.post('./backend/product-delete.php', { id }, function (response) {
                let respuesta = JSON.parse(response);
                let template_bar = '';
                template_bar += `
                            <li style="list-style: none;">status: ${respuesta.status}</li>
                            <li style="list-style: none;">message: ${respuesta.message}</li>
                        `;
                $('#container').html(template_bar);
                $('#product-result').show();
                listarProductos();

            });
        }
    });
}

// SE CREA EL OBJETO DE CONEXIÓN COMPATIBLE CON EL NAVEGADOR
function getXMLHttpRequest() {
    var objetoAjax;

    try {
        objetoAjax = new XMLHttpRequest();
    } catch (err1) {
        /**
         * NOTA: Las siguientes formas de crear el objeto ya son obsoletas
         *       pero se comparten por motivos historico-académicos.
         **/

        try {
            // IE7 y IE8
            objetoAjax = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (err2) {
            try {
                // IE5 y IE6
                objetoAjax = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (err3) {
                objetoAjax = false;
            }
        }
    }
    return objetoAjax;
}
