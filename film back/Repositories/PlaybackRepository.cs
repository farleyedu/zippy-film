using Dapper;
using ZippyFilms.Api.Infrastructure;
using ZippyFilms.Api.Models;

namespace ZippyFilms.Api.Repositories;

public sealed class PlaybackRepository(IDbConnectionFactory connectionFactory) : IPlaybackRepository
{
    public async Task<PlaybackInfo?> GetPlaybackInfoAsync(Guid playableItemId)
    {
        using var connection = connectionFactory.CreateConnection();
        var item = await connection.QuerySingleOrDefaultAsync<PlaybackInfo>("""
            select p.id as PlayableItemId,
                   p.title,
                   concat('/media-stream/', p.id, '/master.m3u8') as HlsUrl,
                   coalesce(p.duration_seconds, 0) as DurationSeconds
            from zippyfilms.playable_items p
            where p.id = @PlayableItemId
            """, new { PlayableItemId = playableItemId });

        if (item is null)
        {
            return null;
        }

        var qualities = await connection.QueryAsync<string>("""
            select quality_label from zippyfilms.stream_variants
            where playable_item_id = @PlayableItemId and status = 'READY'
            order by height
            """, new { PlayableItemId = playableItemId });

        item.Qualities = qualities.DefaultIfEmpty("auto").ToArray();
        item.AudioTracks = ["pt-BR"];
        item.SubtitleTracks = [];
        return item;
    }

    public async Task SaveProgressAsync(Guid profileId, Guid playableItemId, int currentTimeSeconds, int durationSeconds)
    {
        using var connection = connectionFactory.CreateConnection();
        var percent = durationSeconds <= 0 ? 0 : Math.Min(100, Math.Round(currentTimeSeconds * 100m / durationSeconds, 2));
        await connection.ExecuteAsync("""
            insert into zippyfilms.watch_progress
                (id, profile_id, playable_item_id, current_time_seconds, duration_seconds, progress_percent, completed, last_watched_at)
            values
                (@Id, @ProfileId, @PlayableItemId, @CurrentTimeSeconds, @DurationSeconds, @ProgressPercent, @Completed, now())
            on conflict (profile_id, playable_item_id) do update set
                current_time_seconds = excluded.current_time_seconds,
                duration_seconds = excluded.duration_seconds,
                progress_percent = excluded.progress_percent,
                completed = excluded.completed,
                last_watched_at = now(),
                updated_at = now()
            """, new
        {
            Id = Guid.NewGuid(),
            ProfileId = profileId,
            PlayableItemId = playableItemId,
            CurrentTimeSeconds = currentTimeSeconds,
            DurationSeconds = durationSeconds,
            ProgressPercent = percent,
            Completed = percent >= 90
        });
    }
}
