using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ZippyFilms.Api.BackgroundServices;
using ZippyFilms.Api.Infrastructure;
using ZippyFilms.Api.Options;
using ZippyFilms.Api.Repositories;
using ZippyFilms.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

builder.Services.Configure<JwtOptions>(builder.Configuration);
builder.Services.Configure<MediaStorageOptions>(builder.Configuration);
builder.Services.Configure<TmdbOptions>(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration["CORS_ALLOWED_ORIGINS"] ?? "http://localhost:5173";
        policy.WithOrigins(origins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var jwtSecret = builder.Configuration["JWT_SECRET"];
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    jwtSecret = "dev-only-zippyfilms-secret-change-this-value";
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["JWT_ISSUER"] ?? "Zippy",
            ValidAudience = builder.Configuration["JWT_AUDIENCE"] ?? "ZippyClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<IDbConnectionFactory, NpgsqlConnectionFactory>();
builder.Services.AddScoped<MigrationRunner>();
builder.Services.AddScoped<OwnerSeedService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<IMediaRepository, MediaRepository>();
builder.Services.AddScoped<IPlaybackRepository, PlaybackRepository>();
builder.Services.AddScoped<ISettingsRepository, SettingsRepository>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProfileService>();
builder.Services.AddScoped<MediaService>();
builder.Services.AddScoped<PlaybackService>();
builder.Services.AddScoped<SearchService>();
builder.Services.AddScoped<ListService>();
builder.Services.AddScoped<SettingsService>();
builder.Services.AddScoped<ScannerService>();
builder.Services.AddScoped<MetadataService>();
builder.Services.AddScoped<FfprobeService>();
builder.Services.AddScoped<TranscodeService>();
builder.Services.AddHostedService<ScannerWorker>();
builder.Services.AddHostedService<TranscodeWorker>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    if (!string.IsNullOrWhiteSpace(app.Configuration["DATABASE_CONNECTION_STRING"]))
    {
        await scope.ServiceProvider.GetRequiredService<MigrationRunner>().RunAsync();
        await scope.ServiceProvider.GetRequiredService<OwnerSeedService>().SeedAsync();
    }
    else
    {
        logger.LogWarning("DATABASE_CONNECTION_STRING nao configurada. Migrations e seed foram ignorados.");
    }
}

app.Run();
