using System;
using System.IO;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

class Program
{
    static void Main()
    {
        Console.WriteLine("El programa C# está en ejecución.");

        // Especifica la ruta completa al archivo
        string filePath = @"C:\xampp\htdocs\ServiciosWeb\ProyectoFinalV1\Slim\authAPI\access_token.txt"; // Reemplaza con tu ruta real
        string authorizationHeader = File.ReadAllText(filePath);

        // Verifica si el encabezado de autorización está presente y es válido
        if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
        {
            string token = authorizationHeader.Substring("Bearer ".Length);

            // Intenta validar y decodificar el token
            if (TryValidateToken(token, out var claims))
            {
                // El token es válido, puedes acceder a las reclamaciones (claims) aquí
                Console.WriteLine("Token válido");
                foreach (var claim in claims)
                {
                    Console.WriteLine($"{claim.Type}: {claim.Value}");
                }
            }
            else
            {
                Console.WriteLine("Token no válido");
            }
        }
        else
        {
            Console.WriteLine("Encabezado de autorización no válido");
        }
    }

    static bool TryValidateToken(string token, out IEnumerable<Claim> claims)
    {
        try
        {
            // Configura la validación del token (puedes personalizar según tus necesidades)
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,  // Puedes configurar esto según tu caso
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Convert.FromBase64String("7ebe1e9c25f7e9c1047324a14a89b515"))
            };

            // Intenta validar y decodificar el token
            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(token, validationParameters, out var securityToken);

            // Extrae las reclamaciones (claims)
            claims = principal?.Claims;
            return true;
        }
        catch (Exception)
        {
            // La validación del token falló
            claims = null;
            return false;
        }
    }
}




