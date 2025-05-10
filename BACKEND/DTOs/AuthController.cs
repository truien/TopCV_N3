using System.ComponentModel.DataAnnotations;
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
    [Required(ErrorMessage = "Tài khoản không được để trống")]
    public string? Name { get; set; }

    [Required, EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string? Email { get; set; }

    [Required, MinLength(6, ErrorMessage = "Mật khẩu phải ít nhất 6 ký tự")]
    public string? Password { get; set; }

    [Required(ErrorMessage = "Bạn phải chọn vai trò")]
    public int RoleId { get; set; }

    // Với candidate
    public string? FullName { get; set; }

    // Với employer
    public string? CompanyName { get; set; }
}

public class ChangePasswordRequest
{
    public string? UserName { get; set; }
    public string? OldPassword { get; set; }
    public string? NewPassword { get; set; }
}
public class GoogleLoginRequest
{
    [Required] public string? Token { get; set; }
    public int? RoleId { get; set; }
    public string? FullName { get; set; }
    public string? CompanyName { get; set; }
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
    public string? FullName { get; set; }
    public string? CompanyName { get; set; }
}


