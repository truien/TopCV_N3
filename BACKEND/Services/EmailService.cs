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
        string? smtpServer = _config["EmailSettings:SmtpServer"];
        int smtpPort = int.Parse(_config["EmailSettings:SmtpPort"]??"0");
        string? smtpUser = _config["EmailSettings:SmtpUser"];
        string? smtpPass = _config["EmailSettings:SmtpPass"];

        using (var client = new SmtpClient(smtpServer, smtpPort))
        {
            client.EnableSsl = true;
            client.Credentials = new NetworkCredential(smtpUser, smtpPass);
            var mailMessage = new MailMessage
            {
                From = new MailAddress(smtpUser??""),
                Subject = subject,
                Body = body,
                IsBodyHtml = false
            };
            mailMessage.To.Add(toEmail);
            client.Send(mailMessage);
        }
    }
}
