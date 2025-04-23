using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public void SendEmail(string toEmail, string subject, string body)
    {
        string? smtpServer = Environment.GetEnvironmentVariable("SMTP_SERVER") ?? _config["EmailSettings:SmtpServer"];
        string? smtpPortStr = Environment.GetEnvironmentVariable("SMTP_PORT") ?? _config["EmailSettings:SmtpPort"];
        string? smtpUser = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? _config["EmailSettings:SmtpUser"];
        string? smtpPass = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? _config["EmailSettings:SmtpPass"];


        if (string.IsNullOrWhiteSpace(smtpServer) ||
            string.IsNullOrWhiteSpace(smtpPortStr) ||
            string.IsNullOrWhiteSpace(smtpUser) ||
            string.IsNullOrWhiteSpace(smtpPass) ||
            string.IsNullOrWhiteSpace(toEmail))
        {
            throw new Exception("Thiếu thông tin cấu hình SMTP hoặc địa chỉ email đích.");
        }

        int smtpPort = int.Parse(smtpPortStr);

        using (var client = new SmtpClient(smtpServer, smtpPort))
        {
            client.EnableSsl = true;
            client.Credentials = new NetworkCredential(smtpUser, smtpPass);

            var mailMessage = new MailMessage
            {
                From = new MailAddress(smtpUser),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(new MailAddress(toEmail));
            client.Send(mailMessage);
        }
    }
}
