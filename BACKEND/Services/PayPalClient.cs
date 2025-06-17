using PayPalCheckoutSdk.Core;
using Microsoft.Extensions.Configuration;

public class PayPalClient
{
    private readonly IConfiguration _config;
    public PayPalClient(IConfiguration config) => _config = config;

    public PayPalHttpClient Client()
    {
        var env = new SandboxEnvironment(
          _config["PayPal:ClientId"],
          _config["PayPal:Secret"]);
        return new PayPalHttpClient(env);
    }
}
