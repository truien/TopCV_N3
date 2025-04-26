using Microsoft.AspNetCore.Http;

public static class NetworkHelper
{
    public static string GetIpAddress(HttpContext context)
    {
        var ip = context.Connection.RemoteIpAddress?.ToString();
        if (string.IsNullOrEmpty(ip))
            ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();

        return ip ?? "127.0.0.1";
    }
}
