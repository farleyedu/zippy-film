create schema if not exists zippyfilms;
create extension if not exists "uuid-ossp";

create or replace function zippyfilms.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create table if not exists zippyfilms.users (
    id uuid primary key,
    name varchar not null,
    email varchar not null unique,
    password_hash text not null,
    pin_hash text null,
    role varchar not null check (role in ('OWNER', 'USER')),
    status varchar not null check (status in ('ACTIVE', 'BLOCKED', 'DELETED')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    last_login_at timestamptz null
);

create table if not exists zippyfilms.profiles (
    id uuid primary key,
    user_id uuid not null references zippyfilms.users(id) on delete cascade,
    name varchar not null,
    avatar varchar not null,
    is_kids boolean not null default false,
    language varchar not null default 'pt-BR',
    maturity_level varchar not null default 'ALL',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.media (
    id uuid primary key,
    type varchar not null check (type in ('MOVIE', 'SERIES')),
    title varchar not null,
    original_title varchar null,
    overview text null,
    year int null,
    release_date date null,
    first_air_date date null,
    runtime_minutes int null,
    status varchar not null default 'PROCESSING' check (status in ('AVAILABLE', 'PROCESSING', 'FILE_MISSING', 'ERROR', 'HIDDEN')),
    tmdb_id int null,
    imdb_id varchar null,
    poster_url text null,
    backdrop_url text null,
    local_poster_path text null,
    local_backdrop_path text null,
    vote_average numeric null,
    vote_count int null,
    certification varchar null,
    original_language varchar null,
    metadata_status varchar not null default 'PENDING' check (metadata_status in ('PENDING', 'FOUND', 'NOT_FOUND', 'AMBIGUOUS', 'ERROR')),
    last_metadata_sync_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (type, tmdb_id)
);

create table if not exists zippyfilms.seasons (
    id uuid primary key,
    media_id uuid not null references zippyfilms.media(id) on delete cascade,
    season_number int not null,
    title varchar null,
    overview text null,
    tmdb_id int null,
    poster_url text null,
    local_poster_path text null,
    episode_count int null,
    air_date date null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (media_id, season_number)
);

create table if not exists zippyfilms.episodes (
    id uuid primary key,
    media_id uuid not null references zippyfilms.media(id) on delete cascade,
    season_id uuid not null references zippyfilms.seasons(id) on delete cascade,
    episode_number int not null,
    title varchar not null,
    overview text null,
    tmdb_id int null,
    still_url text null,
    local_still_path text null,
    air_date date null,
    runtime_minutes int null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (season_id, episode_number)
);

create table if not exists zippyfilms.playable_items (
    id uuid primary key,
    type varchar not null check (type in ('MOVIE', 'EPISODE')),
    media_id uuid not null references zippyfilms.media(id) on delete cascade,
    season_id uuid null references zippyfilms.seasons(id) on delete cascade,
    episode_id uuid null references zippyfilms.episodes(id) on delete cascade,
    title varchar not null,
    sort_order int not null default 0,
    duration_seconds int null,
    status varchar not null default 'PROCESSING' check (status in ('PROCESSING', 'READY', 'FILE_MISSING', 'ERROR')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.media_files (
    id uuid primary key,
    playable_item_id uuid not null references zippyfilms.playable_items(id) on delete cascade,
    original_path text not null unique,
    relative_path text null,
    file_name varchar not null,
    file_extension varchar null,
    file_size_bytes bigint null,
    file_hash varchar null unique,
    container varchar null,
    video_codec varchar null,
    audio_codec varchar null,
    width int null,
    height int null,
    duration_seconds int null,
    frame_rate numeric null,
    bitrate bigint null,
    status varchar not null default 'DETECTED' check (status in ('DETECTED', 'METADATA_PENDING', 'METADATA_OK', 'TRANSCODING', 'READY', 'FILE_MISSING', 'ERROR')),
    detected_at timestamptz not null default now(),
    last_seen_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.stream_variants (
    id uuid primary key,
    media_file_id uuid not null references zippyfilms.media_files(id) on delete cascade,
    playable_item_id uuid not null references zippyfilms.playable_items(id) on delete cascade,
    quality_label varchar not null,
    width int null,
    height int null,
    video_codec varchar null,
    audio_codec varchar null,
    bitrate bigint null,
    hls_path text null,
    manifest_path text null,
    status varchar not null default 'PROCESSING',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (playable_item_id, quality_label)
);

create table if not exists zippyfilms.audio_tracks (
    id uuid primary key,
    media_file_id uuid not null references zippyfilms.media_files(id) on delete cascade,
    language varchar null,
    label varchar null,
    codec varchar null,
    channels varchar null,
    is_default boolean not null default false,
    stream_index int null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.subtitle_tracks (
    id uuid primary key,
    media_file_id uuid not null references zippyfilms.media_files(id) on delete cascade,
    language varchar null,
    label varchar null,
    format varchar null,
    source varchar not null check (source in ('EMBEDDED', 'EXTERNAL', 'GENERATED', 'MANUAL')),
    file_path text null,
    is_default boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.metadata_cache (
    id uuid primary key,
    provider varchar not null,
    entity_type varchar not null,
    provider_id varchar not null,
    language varchar not null,
    raw_json jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (provider, entity_type, provider_id, language)
);

create table if not exists zippyfilms.watch_progress (
    id uuid primary key,
    profile_id uuid not null references zippyfilms.profiles(id) on delete cascade,
    playable_item_id uuid not null references zippyfilms.playable_items(id) on delete cascade,
    current_time_seconds int not null default 0,
    duration_seconds int not null default 0,
    progress_percent numeric not null default 0,
    completed boolean not null default false,
    last_watched_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (profile_id, playable_item_id)
);

create table if not exists zippyfilms.watch_history (
    id uuid primary key,
    profile_id uuid not null references zippyfilms.profiles(id) on delete cascade,
    playable_item_id uuid not null references zippyfilms.playable_items(id) on delete cascade,
    started_at timestamptz not null default now(),
    finished_at timestamptz null,
    watched_seconds int not null default 0,
    progress_percent numeric not null default 0,
    completed boolean not null default false,
    device_id uuid null,
    created_at timestamptz not null default now()
);

create table if not exists zippyfilms.profile_list_items (
    id uuid primary key,
    profile_id uuid not null references zippyfilms.profiles(id) on delete cascade,
    media_id uuid not null references zippyfilms.media(id) on delete cascade,
    list_type varchar not null check (list_type in ('MY_LIST', 'FAVORITE', 'WATCH_LATER', 'DISLIKED')),
    created_at timestamptz not null default now(),
    unique (profile_id, media_id, list_type)
);

create table if not exists zippyfilms.scan_sources (
    id uuid primary key,
    name varchar not null,
    path text not null,
    media_type varchar not null check (media_type in ('MOVIE', 'SERIES')),
    enabled boolean not null default true,
    last_scan_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.scan_events (
    id uuid primary key,
    scan_source_id uuid null references zippyfilms.scan_sources(id) on delete set null,
    event_type varchar not null check (event_type in ('FILE_FOUND', 'FILE_CHANGED', 'FILE_REMOVED', 'FILE_MOVED', 'SCAN_STARTED', 'SCAN_FINISHED', 'ERROR')),
    file_path text null,
    file_hash varchar null,
    status varchar not null,
    message text null,
    created_at timestamptz not null default now()
);

create table if not exists zippyfilms.transcode_jobs (
    id uuid primary key,
    media_file_id uuid not null references zippyfilms.media_files(id) on delete cascade,
    playable_item_id uuid not null references zippyfilms.playable_items(id) on delete cascade,
    status varchar not null default 'PENDING' check (status in ('PENDING', 'RUNNING', 'DONE', 'FAILED', 'CANCELED')),
    target_profiles jsonb null,
    progress_percent numeric not null default 0,
    started_at timestamptz null,
    finished_at timestamptz null,
    error_message text null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.profile_settings (
    id uuid primary key,
    profile_id uuid not null unique references zippyfilms.profiles(id) on delete cascade,
    default_audio_language varchar null,
    default_subtitle_language varchar null,
    subtitle_enabled boolean not null default true,
    subtitle_size varchar null,
    subtitle_color varchar null,
    subtitle_background varchar null,
    auto_play_next boolean not null default true,
    skip_intro_enabled boolean not null default true,
    default_quality varchar null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.devices (
    id uuid primary key,
    user_id uuid not null references zippyfilms.users(id) on delete cascade,
    name varchar not null,
    device_type varchar not null check (device_type in ('TV', 'MOBILE', 'DESKTOP', 'TABLET')),
    platform varchar null,
    user_agent text null,
    last_ip varchar null,
    last_seen_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.user_sessions (
    id uuid primary key,
    user_id uuid not null references zippyfilms.users(id) on delete cascade,
    device_id uuid null references zippyfilms.devices(id) on delete set null,
    token_hash text not null,
    refresh_token_hash text not null,
    expires_at timestamptz not null,
    revoked_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.app_settings (
    key varchar primary key,
    value jsonb not null,
    updated_at timestamptz not null default now()
);

create table if not exists zippyfilms.audit_logs (
    id uuid primary key,
    user_id uuid null references zippyfilms.users(id) on delete set null,
    profile_id uuid null references zippyfilms.profiles(id) on delete set null,
    action varchar not null,
    entity_type varchar not null,
    entity_id uuid null,
    metadata jsonb null,
    created_at timestamptz not null default now()
);

create index if not exists idx_media_type on zippyfilms.media(type);
create index if not exists idx_media_status on zippyfilms.media(status);
create index if not exists idx_media_title on zippyfilms.media(title);
create index if not exists idx_media_tmdb_id on zippyfilms.media(tmdb_id);
create index if not exists idx_playable_items_media_id on zippyfilms.playable_items(media_id);
create index if not exists idx_playable_items_status on zippyfilms.playable_items(status);
create index if not exists idx_media_files_playable_item_id on zippyfilms.media_files(playable_item_id);
create index if not exists idx_media_files_status on zippyfilms.media_files(status);
create index if not exists idx_media_files_file_hash on zippyfilms.media_files(file_hash);
create index if not exists idx_stream_variants_playable_item_id on zippyfilms.stream_variants(playable_item_id);
create index if not exists idx_watch_progress_profile_id on zippyfilms.watch_progress(profile_id);
create index if not exists idx_watch_progress_playable_item_id on zippyfilms.watch_progress(playable_item_id);
create index if not exists idx_profile_list_items_profile_id on zippyfilms.profile_list_items(profile_id);
create index if not exists idx_profile_list_items_media_id on zippyfilms.profile_list_items(media_id);
create index if not exists idx_scan_events_created_at on zippyfilms.scan_events(created_at);
create index if not exists idx_transcode_jobs_status on zippyfilms.transcode_jobs(status);

do $$
declare
    table_name text;
begin
    foreach table_name in array array[
        'users', 'profiles', 'media', 'seasons', 'episodes', 'playable_items', 'media_files',
        'stream_variants', 'audio_tracks', 'subtitle_tracks', 'metadata_cache', 'watch_progress',
        'scan_sources', 'transcode_jobs', 'profile_settings', 'devices', 'user_sessions'
    ]
    loop
        execute format('drop trigger if exists trg_%s_updated_at on zippyfilms.%I', table_name, table_name);
        execute format('create trigger trg_%s_updated_at before update on zippyfilms.%I for each row execute function zippyfilms.set_updated_at()', table_name, table_name);
    end loop;
end;
$$;
