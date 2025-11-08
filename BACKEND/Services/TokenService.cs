using System.Security.Cryptography;
using System.Text;
using BACKEND.Models;
using BACKEND.Models.Auth;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace BACKEND.Services;

public interface ITokenService
{
    (string plainToken, string hash, DateTime expires) CreateRefreshToken();
    Task SaveAsync(int userId, string hash, DateTime expires);
    Task<bool> ValidateAsync(int userId, string hash);
    Task RevokeAllAsync(int userId);
}

public class TokenService : ITokenService
{
    private readonly TopcvBeContext _db;
    private readonly IRedisService _redis;

    public TokenService(TopcvBeContext db, IRedisService redis)
    {
        _db = db; _redis = redis;
    }

    public (string plainToken, string hash, DateTime expires) CreateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        var plain = Convert.ToBase64String(bytes);
        var hash = Sha256(plain);
        var expires = DateTime.UtcNow.AddDays(14);
        return (plain, hash, expires);
    }

    public async Task SaveAsync(int userId, string hash, DateTime expires)
    {
        await _db.RefreshTokens.AddAsync(new RefreshToken
        {
            UserId = userId,
            TokenHash = hash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expires
        });
        await _db.SaveChangesAsync();

        var key = $"refresh:{userId}";
        await _redis.Db.StringSetAsync(key, hash, expires - DateTime.UtcNow);
    }

    public async Task<bool> ValidateAsync(int userId, string hash)
    {
        var key = $"refresh:{userId}";
        var stored = await _redis.Db.StringGetAsync(key);
        return stored == hash;
    }

    public async Task RevokeAllAsync(int userId)
    {
        await _redis.Db.KeyDeleteAsync($"refresh:{userId}");
        var tokens = await _db.RefreshTokens.Where(r => r.UserId == userId && r.RevokedAt == null).ToListAsync();
        foreach (var t in tokens) t.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    private static string Sha256(string input)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }
}
