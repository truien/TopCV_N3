public class LoginRequest
{
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string? Avatar { get; set; }
    public string? Role { get; set; }
    public string? Token { get; set; }
    public string? Email { get; set; }
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
    public string? UserName { get; set; }
    public string? OldPassword { get; set; }
    public string? NewPassword { get; set; }
}
public class GoogleLoginRequest
{
    public string Token { get; set; } = string.Empty;
}
public class ForgotPasswordRequest
{
    public string? Email { get; set; }
}

public class ResetPasswordRequest
{
    public string? Email { get; set; }
    public string? OTP { get; set; }
    public string? NewPassword { get; set; }
}

public class RegisterGoogleRequest
{
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Avatar { get; set; }
    public int RoleId { get; set; }
}


