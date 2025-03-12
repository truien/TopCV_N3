public class LoginRequest
{
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string? Role { get; set; }
    public string? Token { get; set; }
}
public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int RoleId { get; set; }
}
public class ChangePasswordRequest
{
    public string Username { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

