using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

public class JwtHelper
{
    public string? GetUserIdFromToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();

        try
        {
            var jsonToken = handler.ReadJwtToken(token);
            var userId = jsonToken.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new InvalidOperationException("ID người dùng không tồn tại trong token.");
            }

            return userId;  
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi khi lấy ID người dùng từ token: {ex.Message}");
            return null; 
        }
    }
}
