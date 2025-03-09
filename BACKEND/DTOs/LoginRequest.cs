public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
public class RefreshRequest
{
    public string? RefreshToken { get; set; }
}

public class LogoutRequest
{
    public string? RefreshToken { get; set; }
}
