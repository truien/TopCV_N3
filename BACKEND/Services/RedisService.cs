using StackExchange.Redis;

namespace BACKEND.Services;

public interface IRedisService
{
    IDatabase Db { get; }
}

public class RedisService : IRedisService
{
    private readonly IConnectionMultiplexer _muxer;

    public RedisService(IConnectionMultiplexer muxer)
    {
        _muxer = muxer;
    }

    public IDatabase Db => _muxer.GetDatabase();
}
