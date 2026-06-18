# ZippyFilms Front

Frontend React + Vite + TypeScript, TV-first, falando direto com Jellyfin.

## Variaveis

```env
Nao precisa de backend Zippy no MVP. Informe a URL do Jellyfin na tela de login, por exemplo:

```text
http://192.168.0.25:8096
```

## Rodar

Instale Node.js e execute:

```bash
npm install
npm run dev
```

Rotas principais:

- `/login`
- `/profiles`
- `/`
- `/movies`
- `/series`
- `/search`
- `/watch/:playableItemId`

Login chama a API do Jellyfin:

- `POST /Users/AuthenticateByName`

O Zippy salva localmente `serverUrl`, `accessToken`, `userId` e `deviceId`.
