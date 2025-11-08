using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using BACKEND.Hubs;
using StackExchange.Redis;
using BACKEND.Services;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

builder.Services.AddMemoryCache();
builder.Services.AddSingleton<EmailService>();
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("RedisConnection")!)
);
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddSingleton<IRedisService, RedisService>();

builder.Services.AddDbContext<TopcvBeContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    )
);

builder.Services.AddHttpContextAccessor();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAuthorization();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection("JwtSettings");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["Secret"]!)
            ),
            ClockSkew = TimeSpan.Zero 
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Ưu tiên đọc token từ cookie nếu có
                if (context.Request.Cookies.ContainsKey("access"))
                {
                    var tokenFromCookie = context.Request.Cookies["access"];
                    if (!string.IsNullOrEmpty(tokenFromCookie))
                    {
                        context.Token = tokenFromCookie;
                        Console.WriteLine($"[JWT] Token read from cookie: {tokenFromCookie.Substring(0, Math.Min(20, tokenFromCookie.Length))}...");
                    }
                }
                else
                {
                    Console.WriteLine("[JWT] No 'access' cookie found in request");
                    // Log all cookies for debugging
                    foreach (var cookie in context.Request.Cookies)
                    {
                        Console.WriteLine($"[JWT] Cookie found: {cookie.Key}");
                    }
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT] Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "TopCV Clone", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập token theo định dạng: Bearer {token}"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://top-cv-n3.vercel.app",
            "https://top-cv-n3-5zs5gnzq4-truiens-projects-27a8e364.vercel.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5046);
    serverOptions.ListenAnyIP(7026, listenOptions => listenOptions.UseHttps());
});

builder.Services.AddHostedService<TopMaxPostDateUpdaterService>();
builder.Services.AddSingleton<PayPalClient>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddSignalR();

builder.Services.AddControllers();

var app = builder.Build();

app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "TopCV Clone API"));
}

app.UseCors("AllowFrontend");

// Chỉ redirect HTTPS trong production
if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
