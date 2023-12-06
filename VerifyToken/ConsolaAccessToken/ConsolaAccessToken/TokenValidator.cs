using System;
using System.Net.Http;
using System.Threading.Tasks;

public static class TokenValidator
{
    public static async Task ValidateAccessToken(string accessToken)
    {
        using (HttpClient client = new HttpClient())
        {
            string validationUrl = "http://127.0.0.1:8000/validate-token";
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

            HttpResponseMessage response = await client.GetAsync(validationUrl);

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("Token válido.");
            }
            else
            {
                Console.WriteLine("Token no válido.");
            }
        }
    }

    private static async Task ValidateAccessTokenInternal(string accessToken)
    {
        // Lógica de validación del token
        string validationUrl = "http://127.0.0.1:8000/validate-token";

        using (HttpClient client = new HttpClient())
        {
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

            HttpResponseMessage response = await client.GetAsync(validationUrl);

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("Token válido.");
            }
            else
            {
                Console.WriteLine("Token no válido.");
            }
        }
    }
}