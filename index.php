<?php


use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Slim\Handlers\ErrorHandler;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;


require __DIR__ . '../vendor/autoload.php';

$rutaCredenciales = __DIR__ . '/Credenciales/CredencialesV2.json';


$firebaseFactory = (new Factory)
    ->withServiceAccount($rutaCredenciales)
    ->withDatabaseUri('https://proyecto06-b22eb-default-rtdb.firebaseio.com');

$database = $firebaseFactory->createDatabase();
$auth = $firebaseFactory->createAuth();
$app = AppFactory::create();
$app->setBasePath("/serviciosweb/lospostman");



function authenticateUser($user, $password, $database, $response)
{
    try {
        // Obtén el usuario de la colección "usuarios" en Firebase
        $userRef = $database->getReference("usuarios");
        $snapshot = $userRef->getChild($user)->getSnapshot();


        if ($snapshot->exists()) {
            $userR = $database->getReference("usuarios/$user");
            $userData = $userR->getSnapshot()->getValue();
            $encrypassword = md5($password);

            if ($userData == $encrypassword) {
                // Autenticación exitosa
                return ['success' => true];
            } else {
                // Usuario no encontrado o contraseña incorrecta
                return ['success' => false, 'error' => 'Password no reconocido'];
            }
        } else {
            return ['success' => false, 'error' => 'Usuario no encontrado'];
        }
    } catch (\Exception $e) {
        return ['success' => false, 'error' => 'Error de inicio de sesión'];
    }
}

$app->get('/', function (Request $request, Response $response) use ($database) {

    $user = $request->getHeader('user')[0];
    $password = $request->getHeader('pass')[0];

    $authResult = authenticateUser($user, $password, $database, $response);

    if ($authResult['success']) {
        // Autenticación exitosa
        $reference = $database->getReference('productos');
        $data = $reference->getValue();

        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode(['message' => $authResult['error']]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
});

# RUTA PARA INICIO DE SESION
$app->post('/autenticacion', function (Request $request, Response $response, $args) use ($database) {
    $user = $request->getHeader('user')[0];
    $password = $request->getHeader('pass')[0];

    $authResult = authenticateUser($user, $password, $database, $response);

    if ($authResult['success']) {
        // Autenticación exitosa
        $response->getBody()->write(json_encode([
            'code' => '200',
            'message' => 'Inicio de sesión exitoso',
            'status' => 'Success'
        ]));
        return $response->withHeader('Content-Type', 'application/json')
        ->withHeader('Location', 'dashboard.html');
    } else {
        // Usuario no encontrado o contraseña incorrecta
        $response->getBody()->write(json_encode([
            'code' => '501',
            'message' => $authResult['error'],
            'status' => 'Error',
        ]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
});

# Ruta para Iniciar sesion
$app->post('/login', function (Request $request, Response $response) use ($database) {
    $data = $request->getParsedBody();
    $user = $data['user'];
    $password = $data['pass'];


    if (authenticateUser($user, $password, $database, $response)) {
        // Autenticación exitosa
        $response->getBody()->write(json_encode(['message' => 'Inicio de sesión exitoso']));
        return $response->withHeader('Content-Type', 'application/json')
        ->withHeader('Location','dashboard.html');
    } else {
        // Usuario no encontrado o contraseña incorrecta
        $response->getBody()->write(json_encode(['message' => 'Error de inicio de sesión']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
});



// Aplica el middleware de autenticación a rutas específicas
$app->get('/ruta-protegida', function (Request $request, Response $response, $args) {
    // Esta ruta solo será accesible por usuarios autenticados debido al middleware.
    $response->getBody()->write(json_encode(['message' => 'Ruta protegida']));
    return $response->withHeader('Content-Type', 'application/json');
});


$app->get('/productos/{categoria}', function (Request $request, Response $response, $args) use ($database) {

    $user = $request->getHeader('user')[0];
    $password = $request->getHeader('pass')[0];

    $authResult = authenticateUser($user, $password, $database, $response);

    if ($authResult['success']) {
        // Autenticación exitosa
        $categoria = $args['categoria'];

        // Obtener referencia a la colección de productos específica según la categoría
        $productosRef = $database->getReference("productos/$categoria");

        // Realizar consulta para obtener los productos de la categoría especificada
        $snapshot = $productosRef->getSnapshot();

        // Verificar si hay productos en la categoría
        if (!$snapshot->hasChildren()) {
            $responseData = [
                'code' => '300',
                'message' => "No hay productos en la categoría '$categoria'",
                'data' => ' ',
                'status' => 'Success'
            ];
            $response->getBody()->write(json_encode($responseData, JSON_PRETTY_PRINT));
            return $response->withStatus(300)->withHeader('Content-Type', 'application/json');
        }

        // Obtener datos de los productos
        $productos = $snapshot->getValue();

        $Mensaje = [
            'code' => '200',
            'message' => "Categoria encotrada exitosamente",
            'data' => $productos,
            'status' => 'Success'
        ];

        // Construir manualmente la respuesta JSON
        $response->getBody()->write(json_encode($Mensaje, JSON_PRETTY_PRINT));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode([
            'code' => '501',
            'message' => $authResult['error'],
            'status' => 'Error',
        ]));
        return $response->withStatus(501)->withHeader('Content-Type', 'application/json');
    }
});

$app->get('/detalles/{clave}', function (Request $request, Response $response, $args) use ($database) {
    $user = $request->getHeader('user')[0];
    $password = $request->getHeader('pass')[0];

    $authResult = authenticateUser($user, $password, $database, $response);

    if ($authResult['success']) {
        // Autenticación exitosa

        $clave = strtoupper($args['clave']);

        // Obtener referencia a la colección de productos específica según la categoría
        $productosRef = $database->getReference("detalles/$clave");

        // Realizar consulta para obtener los productos de la categoría especificada
        $snapshot = $productosRef->getSnapshot();

        // Verificar si hay productos en la categoría
        if (!$snapshot->hasChildren()) {
            $responseData = [
                'code' => '300',
                'message' => "No hay productos en la categoría '$clave'",
                'data' => ' ',
                'status' => 'Success'
            ];
            $response->getBody()->write(json_encode($responseData, JSON_PRETTY_PRINT));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Obtener datos de los productos
        $productos = $snapshot->getValue();


        $Mensaje = [
            'code' => '200',
            'message' => "Categoria encotrada exitosamente",
            'data' => $productos,
            'status' => 'Success'
        ];

        // Construir manualmente la respuesta JSON
        $response->getBody()->write(json_encode($Mensaje, JSON_PRETTY_PRINT));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        // Usuario no encontrado o contraseña incorrecta
        $response->getBody()->write(json_encode([
            'code' => '501',
            'message' => $authResult['error'],
            'status' => 'Error',
        ]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
});

// RUTA PARA INSERTAR NUEVO REGISTRO
$app->put('/productos/{categoria}', function (Request $request, Response $response, $args) use ($database) {

    $user = $request->getHeader('user')[0];
    $password = $request->getHeader('pass')[0];
    $authResult = authenticateUser($user, $password, $database, $response);

    if ($authResult['success']) {
        // Autenticación exitosa
        $categoria = $args['categoria'];
        $data = json_decode($request->getBody(), true);

        // Asegúrate de que se proporcionen datos válidos en el cuerpo de la solicitud
        $requiredFields = ['ISBN', 'Autor', 'Nombre', 'Editorial', 'Fecha', 'Precio', 'Descuento'];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $response->getBody()->write(json_encode(['error' => "El campo $field es obligatorio"]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
        }

        // Utilizar el ISBN como clave única para el nuevo producto
        $isbn = $data['ISBN'];
        $productosRef = $database->getReference("detalles/$isbn");

        // Verificar si ya existe un producto con el mismo ISBN
        if ($productosRef->getSnapshot()->hasChildren()) {
            $response->getBody()->write(json_encode([
                'code' => '300',
                'message' => "Categoria No encontrada '$categoria'",
                'data' => ' ',
                'status' => 'Error'
            ]));
            return $response->withStatus(300)->withHeader('Content-Type', 'application/json');
        }

        // Construir la estructura de datos para el nuevo producto sin la fecha de inserción
        $nuevoProducto = [
            'ISBN' => $isbn,
            'Autor' => $data['Autor'],
            'Nombre' => $data['Nombre'],
            'Editorial' => $data['Editorial'],
            'Fecha' => $data['Fecha'],
            'Precio' => $data['Precio'],
            'Descuento' => $data['Descuento'],
        ];

        // Insertar el nuevo producto en la base de datos Firebase
        $productosRef->set($nuevoProducto);
        // Obtener la fecha actual en el formato deseado
        $fechaInsercion = date('Y-m-d H:i:s');

        $Mensaje = [
            'code' => '202',
            'message' => "Producto registrado correctamente",
            'data' =>  $fechaInsercion,
            'status' => 'Success'
        ];

        // Retornar un mensaje de éxito con la fecha de inserción
        $response->getBody()->write(json_encode([$Mensaje, JSON_PRETTY_PRINT]));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    } else {
        // Usuario no encontrado o contraseña incorrecta
        $response->getBody()->write(json_encode([
            'code' => '501',
            'message' => $authResult['error'],
            'status' => 'Error',
        ]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
});

$app->put('/productos/detalles/{isbn}', function (Request $request, Response $response, $args) use ($database) {

    $user = $request->getHeader('user')[0];
    $password = $request->getHeader('pass')[0];

    $authResult = authenticateUser($user, $password, $database, $response);

    if ($authResult['success']) {
        // Autenticación exitosa
        $isbn = strtoupper($args['isbn']);
        $data = json_decode($request->getBody(), true);

        // Verificar si el producto con el ISBN dado existe
        $productosRef = $database->getReference("detalles/$isbn");
        $snapshot = $productosRef->getSnapshot();

        if (!$snapshot->hasChildren()) {
            $response->getBody()->write(json_encode([
                'code' => '300',
                'message' => "ISBN No encontrado '$isbn'",
                'data' => ' ',
                'status' => 'Error'
            ]));
            return $response->withStatus(300)->withHeader('Content-Type', 'application/json');
        }

        // Asegúrate de que se proporcionen datos válidos en el cuerpo de la solicitud
        $requiredFields = ['Autor', 'Nombre', 'Editorial', 'Fecha', 'Precio', 'Descuento'];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $response->getBody()->write(json_encode(['error' => "El campo $field es obligatorio"]));
                return $response->withStatus(300)->withHeader('Content-Type', 'application/json');
            }
        }

        // Construir la estructura de datos actualizada para el producto
        $productoActualizado = [
            'ISBN' => $isbn,
            'Autor' => $data['Autor'],
            'Nombre' => $data['Nombre'],
            'Editorial' => $data['Editorial'],
            'Fecha' => $data['Fecha'],
            'Precio' => $data['Precio'],
            'Descuento' => $data['Descuento'],
        ];

        // Actualizar los detalles del producto en la base de datos Firebase
        $productosRef->update($productoActualizado);

        // Obtener la fecha actual en el formato deseado
        $fechaModificacion = date('Y-m-d H:i:s');

        $Mensaje = [
            'code' => '202',
            'message' => "Producto registrado correctamente",
            'data' =>  $fechaModificacion,
            'status' => 'Success'
        ];

        // Retornar un mensaje de éxito
        $response->getBody()->write(json_encode([$Mensaje, JSON_PRETTY_PRINT]));
        return $response->withStatus(202)->withHeader('Content-Type', 'application/json');
    } else {
        // Usuario no encontrado o contraseña incorrecta
        $response->getBody()->write(json_encode([
            'code' => '501',
            'message' => $authResult['error'],
            'status' => 'Error',
        ]));
        return $response->withStatus(501)->withHeader('Content-Type', 'application/json');
    }
});



$app->delete('/productos/{isbn}', function (Request $request, Response $response, $args) use ($database) {

    $user = $request->getHeader('user')[0];
    $password = $request->getHeader('pass')[0];

    $authResult = authenticateUser($user, $password, $database, $response);

    if ($authResult['success']) {
        // Autenticación exitosa
        $isbn = strtoupper($args['isbn']);

        // Verificar si el producto con el ISBN dado existe
        $productosRef = $database->getReference("detalles/$isbn");
        $snapshot = $productosRef->getSnapshot();

        if (!$snapshot->hasChildren()) {
            $response->getBody()->write(json_encode([
                'code' => '300',
                'message' => "ISBN No encontrado '$isbn'",
                'data' => ' ',
                'status' => 'Error'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Eliminar el producto de la base de datos Firebase
        $productosRef->remove();

        // Obtener la fecha actual en el formato deseado
        $fechaEliminacion = date('Y-m-d H:i:s');


        $Mensaje = [
            'code' => '204',
            'message' => "Producto eliminado correctamente",
            'data' =>  $fechaEliminacion,
            'status' => 'Success'
        ];

        // Retornar un mensaje de éxito
        $response->getBody()->write(json_encode([$Mensaje, JSON_PRETTY_PRINT]));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    } else {
        // Usuario no encontrado o contraseña incorrecta
        $response->getBody()->write(json_encode([
            'code' => '501',
            'message' => $authResult['error'],
            'status' => 'Error',
        ]));
        return $response->withStatus(501)->withHeader('Content-Type', 'application/json');
    }
});

$app->run();
