# ZippyFilms API

Backend ASP.NET Core com Dapper, PostgreSQL Railway e schema `zippyfilms`.

## Variaveis

```env
DATABASE_CONNECTION_STRING=...
TMDB_API_KEY=...
TMDB_LANGUAGE=pt-BR
MEDIA_ROOT_PATH=...
MOVIES_PATH=...
SERIES_PATH=...
JWT_SECRET=troque-este-segredo
JWT_ISSUER=Zippy
JWT_AUDIENCE=ZippyClient
CORS_ALLOWED_ORIGINS=http://localhost:5173
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe
SEED_OWNER_NAME=Farley
SEED_OWNER_EMAIL=farleysilvae@gmail.com
SEED_OWNER_PASSWORD=ChangeMe123!
SEED_OWNER_PIN=2580
```

## Rodar

```bash
dotnet restore
dotnet run
```

Na inicializacao, se `DATABASE_CONNECTION_STRING` existir, a API executa as migrations em `Migrations/` e cria o usuario OWNER inicial se ainda nao houver OWNER.

## Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/pin-login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

O frontend deve enviar `Authorization: Bearer <accessToken>` para rotas protegidas.
