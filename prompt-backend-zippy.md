# PROMPT BACKEND — ZIPPYFILMS

Você vai criar o backend da plataforma Zippy.

## Contexto do produto

Zippy é uma plataforma pessoal de streaming via navegador.

O usuário coloca filmes e séries em uma pasta local no PC. O sistema detecta automaticamente, identifica o conteúdo, consulta o TMDB apenas quando necessário, salva os dados no PostgreSQL Railway, converte os vídeos para HLS com FFmpeg e entrega para o frontend tocar com Shaka Player.

## Stack obrigatória

- .NET
- ASP.NET Core Web API
- Dapper
- PostgreSQL
- Npgsql
- JWT
- Background Services
- FFmpeg
- FFprobe
- TMDB API
- Docker opcional para API/Workers
- Não criar container de PostgreSQL

## Banco

O banco PostgreSQL já existe no Railway.

Não hardcodar connection string.

Usar variável de ambiente:

`DATABASE_CONNECTION_STRING`

Criar schema novo:

`zippyfilms`

A primeira migration deve criar tudo do zero dentro desse schema.

Nome sugerido:

`001_create_zippyfilms_schema.sql`

## Variáveis de ambiente

Usar:

`DATABASE_CONNECTION_STRING=...`
`TMDB_API_KEY=...`
`TMDB_LANGUAGE=pt-BR`
`MEDIA_ROOT_PATH=...`
`MOVIES_PATH=...`
`SERIES_PATH=...`
`JWT_SECRET=...`
`JWT_ISSUER=Zippy`
`JWT_AUDIENCE=ZippyClient`
`CORS_ALLOWED_ORIGINS=http://localhost:5173`
`FFMPEG_PATH=ffmpeg`
`FFPROBE_PATH=ffprobe`

As pastas serão adaptadas depois pelo usuário.

## Usuário inicial

Criar seed de usuário inicial usando variáveis:

`SEED_OWNER_NAME=Farley`
`SEED_OWNER_EMAIL=farleysilvae@gmail.com`
`SEED_OWNER_PASSWORD=ChangeMe123!`
`SEED_OWNER_PIN=2580`

Na primeira execução, se não existir usuário OWNER, criar automaticamente.

Não salvar senha pura.
Salvar `password_hash`.

## Módulos

Criar módulos:

- Auth
- Profiles
- Media
- Playback
- Search
- Lists
- Settings
- Scanner
- Metadata
- Transcode
- Streaming
- Devices
- Sessions

## Estrutura sugerida

`Controllers`
`Services`
`Repositories`
`Models`
`DTOs`
`Infrastructure`
`BackgroundServices`
`Migrations`
`Options`
`Common`

Separar regra de negócio de controller.

Controllers só recebem request, chamam service e retornam response.

## Migration inicial

Criar schema:

`zippyfilms`

Criar extensão UUID se necessário.

Criar função/trigger para atualizar `updated_at`.

Criar estas tabelas:

### `users`

Campos:
- id uuid primary key
- name varchar
- email varchar unique
- password_hash text
- pin_hash text nullable
- role varchar
- status varchar
- created_at timestamptz
- updated_at timestamptz
- last_login_at timestamptz

Checks:
- role em `OWNER`, `USER`
- status em `ACTIVE`, `BLOCKED`, `DELETED`

### `profiles`

Campos:
- id uuid primary key
- user_id uuid FK users
- name varchar
- avatar varchar
- is_kids boolean
- language varchar
- maturity_level varchar
- created_at
- updated_at

### `media`

Representa filme ou série.

Campos:
- id uuid primary key
- type varchar
- title varchar
- original_title varchar
- overview text
- year int
- release_date date
- first_air_date date
- runtime_minutes int
- status varchar
- tmdb_id int
- imdb_id varchar
- poster_url text
- backdrop_url text
- local_poster_path text
- local_backdrop_path text
- vote_average numeric
- vote_count int
- certification varchar
- original_language varchar
- metadata_status varchar
- last_metadata_sync_at timestamptz
- created_at
- updated_at

Checks:
- type em `MOVIE`, `SERIES`
- status em `AVAILABLE`, `PROCESSING`, `FILE_MISSING`, `ERROR`, `HIDDEN`
- metadata_status em `PENDING`, `FOUND`, `NOT_FOUND`, `AMBIGUOUS`, `ERROR`

Unique:
- type + tmdb_id

### `seasons`

Campos:
- id uuid primary key
- media_id uuid FK media
- season_number int
- title varchar
- overview text
- tmdb_id int
- poster_url text
- local_poster_path text
- episode_count int
- air_date date
- created_at
- updated_at

Unique:
- media_id + season_number

### `episodes`

Campos:
- id uuid primary key
- media_id uuid FK media
- season_id uuid FK seasons
- episode_number int
- title varchar
- overview text
- tmdb_id int
- still_url text
- local_still_path text
- air_date date
- runtime_minutes int
- created_at
- updated_at

Unique:
- season_id + episode_number

### `playable_items`

Representa algo que pode ser reproduzido: filme ou episódio.

Campos:
- id uuid primary key
- type varchar
- media_id uuid FK media
- season_id uuid nullable FK seasons
- episode_id uuid nullable FK episodes
- title varchar
- sort_order int
- duration_seconds int
- status varchar
- created_at
- updated_at

Checks:
- type em `MOVIE`, `EPISODE`
- status em `PROCESSING`, `READY`, `FILE_MISSING`, `ERROR`

### `media_files`

Representa arquivo físico local.

Campos:
- id uuid primary key
- playable_item_id uuid FK playable_items
- original_path text
- relative_path text
- file_name varchar
- file_extension varchar
- file_size_bytes bigint
- file_hash varchar
- container varchar
- video_codec varchar
- audio_codec varchar
- width int
- height int
- duration_seconds int
- frame_rate numeric
- bitrate bigint
- status varchar
- detected_at timestamptz
- last_seen_at timestamptz
- created_at
- updated_at

Checks:
- status em `DETECTED`, `METADATA_PENDING`, `METADATA_OK`, `TRANSCODING`, `READY`, `FILE_MISSING`, `ERROR`

Unique:
- file_hash
- original_path

### `stream_variants`

Versões HLS.

Campos:
- id uuid primary key
- media_file_id uuid FK media_files
- playable_item_id uuid FK playable_items
- quality_label varchar
- width int
- height int
- video_codec varchar
- audio_codec varchar
- bitrate bigint
- hls_path text
- manifest_path text
- status varchar
- created_at
- updated_at

Unique:
- playable_item_id + quality_label

### `audio_tracks`

Campos:
- id uuid primary key
- media_file_id uuid FK media_files
- language varchar
- label varchar
- codec varchar
- channels varchar
- is_default boolean
- stream_index int
- created_at
- updated_at

### `subtitle_tracks`

Campos:
- id uuid primary key
- media_file_id uuid FK media_files
- language varchar
- label varchar
- format varchar
- source varchar
- file_path text
- is_default boolean
- created_at
- updated_at

Checks:
- source em `EMBEDDED`, `EXTERNAL`, `GENERATED`, `MANUAL`

### `metadata_cache`

Cache bruto do TMDB.

Campos:
- id uuid primary key
- provider varchar
- entity_type varchar
- provider_id varchar
- language varchar
- raw_json jsonb
- created_at
- updated_at

Unique:
- provider + entity_type + provider_id + language

### `watch_progress`

Campos:
- id uuid primary key
- profile_id uuid FK profiles
- playable_item_id uuid FK playable_items
- current_time_seconds int
- duration_seconds int
- progress_percent numeric
- completed boolean
- last_watched_at timestamptz
- created_at
- updated_at

Unique:
- profile_id + playable_item_id

### `watch_history`

Campos:
- id uuid primary key
- profile_id uuid FK profiles
- playable_item_id uuid FK playable_items
- started_at timestamptz
- finished_at timestamptz
- watched_seconds int
- progress_percent numeric
- completed boolean
- device_id uuid nullable
- created_at timestamptz

### `profile_list_items`

Campos:
- id uuid primary key
- profile_id uuid FK profiles
- media_id uuid FK media
- list_type varchar
- created_at

Checks:
- list_type em `MY_LIST`, `FAVORITE`, `WATCH_LATER`, `DISLIKED`

Unique:
- profile_id + media_id + list_type

### `scan_sources`

Campos:
- id uuid primary key
- name varchar
- path text
- media_type varchar
- enabled boolean
- last_scan_at timestamptz
- created_at
- updated_at

Checks:
- media_type em `MOVIE`, `SERIES`

### `scan_events`

Campos:
- id uuid primary key
- scan_source_id uuid nullable FK scan_sources
- event_type varchar
- file_path text
- file_hash varchar
- status varchar
- message text
- created_at timestamptz

Checks:
- event_type em `FILE_FOUND`, `FILE_CHANGED`, `FILE_REMOVED`, `FILE_MOVED`, `SCAN_STARTED`, `SCAN_FINISHED`, `ERROR`

### `transcode_jobs`

Campos:
- id uuid primary key
- media_file_id uuid FK media_files
- playable_item_id uuid FK playable_items
- status varchar
- target_profiles jsonb
- progress_percent numeric
- started_at timestamptz
- finished_at timestamptz
- error_message text
- created_at
- updated_at

Checks:
- status em `PENDING`, `RUNNING`, `DONE`, `FAILED`, `CANCELED`

### `profile_settings`

Campos:
- id uuid primary key
- profile_id uuid FK profiles unique
- default_audio_language varchar
- default_subtitle_language varchar
- subtitle_enabled boolean
- subtitle_size varchar
- subtitle_color varchar
- subtitle_background varchar
- auto_play_next boolean
- skip_intro_enabled boolean
- default_quality varchar
- created_at
- updated_at

### `devices`

Campos:
- id uuid primary key
- user_id uuid FK users
- name varchar
- device_type varchar
- platform varchar
- user_agent text
- last_ip varchar
- last_seen_at timestamptz
- created_at
- updated_at

Checks:
- device_type em `TV`, `MOBILE`, `DESKTOP`, `TABLET`

### `user_sessions`

Campos:
- id uuid primary key
- user_id uuid FK users
- device_id uuid nullable FK devices
- token_hash text
- refresh_token_hash text
- expires_at timestamptz
- revoked_at timestamptz
- created_at
- updated_at

### `app_settings`

Campos:
- key varchar primary key
- value jsonb
- updated_at timestamptz

### `audit_logs`

Campos:
- id uuid primary key
- user_id uuid nullable FK users
- profile_id uuid nullable FK profiles
- action varchar
- entity_type varchar
- entity_id uuid nullable
- metadata jsonb
- created_at timestamptz

## Índices

Criar índices para:

- media(type)
- media(status)
- media(title)
- media(tmdb_id)
- playable_items(media_id)
- playable_items(status)
- media_files(playable_item_id)
- media_files(status)
- media_files(file_hash)
- stream_variants(playable_item_id)
- watch_progress(profile_id)
- watch_progress(playable_item_id)
- profile_list_items(profile_id)
- profile_list_items(media_id)
- scan_events(created_at)
- transcode_jobs(status)

## Endpoints

### Auth

- `POST /api/auth/login`
- `POST /api/auth/pin-login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Profiles

- `GET /api/profiles`
- `POST /api/profiles`
- `PUT /api/profiles/{id}`
- `POST /api/profiles/{id}/select`

### Home

- `GET /api/home`

### Media

- `GET /api/media/movies`
- `GET /api/media/series`
- `GET /api/media/{id}`
- `GET /api/media/{id}/seasons`
- `GET /api/media/{id}/seasons/{seasonNumber}`
- `GET /api/media/{id}/episodes`

### Playback

- `GET /api/playback/{playableItemId}`
- `POST /api/playback/{playableItemId}/start`
- `POST /api/playback/{playableItemId}/progress`
- `POST /api/playback/{playableItemId}/finish`

### Lists

- `GET /api/lists`
- `POST /api/lists`
- `DELETE /api/lists/{id}`

### Search

- `GET /api/search?q=`

### Scanner

- `POST /api/scanner/run`
- `GET /api/scanner/events`
- `GET /api/scanner/sources`

### Settings

- `GET /api/settings`
- `PUT /api/settings`

### Streaming

- `GET /media-stream/{playableItemId}/master.m3u8`
- `GET /media-stream/{playableItemId}/{quality}/{segment}`

## Serviços internos

### ScannerWorker

Responsável por:
- monitorar MOVIES_PATH e SERIES_PATH;
- detectar arquivos novos;
- detectar arquivos removidos;
- identificar filme ou episódio;
- extrair nome, ano, temporada e episódio;
- criar scan_events;
- criar media_file;
- enviar para MetadataService.

### MetadataService

Responsável por:
- consultar banco antes de chamar TMDB;
- usar metadata_cache quando existir;
- chamar TMDB somente quando necessário;
- salvar media, seasons e episodes;
- salvar metadata_cache;
- atualizar metadata_status;
- salvar URLs de poster, backdrop e still.

### FFprobeService

Responsável por:
- ler duração;
- ler codec;
- ler resolução;
- ler bitrate;
- ler áudio;
- ler legendas embutidas.

### TranscodeWorker

Responsável por:
- ler transcode_jobs pendentes;
- chamar FFmpeg;
- gerar HLS;
- gerar 480p, 720p, 1080p e 4K quando aplicável;
- atualizar progress_percent;
- criar stream_variants;
- marcar playable_item como READY.

### PlaybackService

Responsável por:
- retornar dados para o player;
- retornar HLS URL;
- retornar qualidades;
- retornar áudios;
- retornar legendas;
- salvar progresso;
- marcar concluído acima de 90%.

## Regras importantes

TMDB:
- frontend nunca chama TMDB;
- player nunca chama TMDB;
- home nunca chama TMDB;
- só MetadataService chama TMDB;
- antes de chamar TMDB, verificar banco/cache;
- salvar resposta bruta em metadata_cache.raw_json.

Arquivos:
- não salvar vídeo no banco;
- banco salva path, hash, status e metadados;
- se arquivo sumiu, marcar FILE_MISSING;
- não apagar registro automaticamente.

Séries:
- detectar padrões:
  - S01E01;
  - S1E1;
  - 1x01.
- usar pasta da série como nome principal;
- usar pasta da temporada quando existir.

Filmes:
- detectar padrão:
  - Nome do Filme (2023)
- se não tiver ano, buscar por nome;
- se houver múltiplos resultados fortes, marcar AMBIGUOUS.

Autenticação:
- usar JWT;
- criar refresh token;
- permitir sessão longa para TV;
- suportar PIN de 4 dígitos.

## Qualidade de código

- usar Dapper;
- criar repositories;
- criar services;
- criar DTOs;
- não colocar SQL solto nos controllers;
- logs estruturados;
- erros padronizados;
- README com variáveis e execução;
- migration SQL revisável;
- código simples, direto e organizado.

## Resultado esperado

Backend compilando com:
- migration inicial completa;
- schema zippyfilms;
- conexão PostgreSQL via env;
- usuário seed OWNER;
- endpoints principais;
- scanner preparado;
- TMDB service preparado;
- FFmpeg worker preparado;
- playback preparado para Shaka Player;
- sem banco local no Docker.
