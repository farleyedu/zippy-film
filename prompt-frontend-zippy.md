# PROMPT FRONTEND — ZIPPYFILMS

Você vai criar o frontend da plataforma Zippy.

## Contexto do produto

Zippy é uma aplicação web pessoal de streaming, otimizada para TV, onde o usuário assiste filmes e séries pelo navegador.

O visual deve ser inspirado em plataformas premium de streaming:
- fundo escuro;
- vermelho como cor principal;
- hero banner grande;
- carrosséis horizontais;
- cards grandes;
- player fullscreen;
- navegação confortável em TV;
- transições suaves;
- estética premium.

Não usar nome, logo ou marca da Netflix. O nome oficial do app é **Zippy**.

## Stack obrigatória

- React
- Vite
- TypeScript
- React Router
- Shaka Player
- CSS organizado, sem biblioteca visual pesada
- API service separado
- Mocks locais enquanto o backend não estiver pronto

## Prioridade visual

A aplicação é **TV-first**.

Priorizar:
- TV 55” e 65”;
- Samsung/TCL;
- navegador de TV;
- controle remoto;
- navegação por teclado;
- foco visual forte;
- cards grandes;
- texto legível de longe.

Desktop e mobile devem funcionar, mas TV é a prioridade.

## Cores

Use esta base:

- fundo: `#050505`
- fundo secundário: `#0c0c0c`
- vermelho principal: `#e50914`
- vermelho hover: `#f6121d`
- texto principal: `#ffffff`
- texto secundário: `#b3b3b3`
- sucesso/progresso: `#46d369`

## Rotas

Criar estas rotas:

### `/login`

Tela de login.

Deve ter:
- logo Zippy;
- email;
- senha;
- PIN de 4 dígitos;
- botão Entrar;
- visual escuro, elegante e centralizado;
- fundo com imagem escura e gradiente.

### `/profiles`

Tela de escolha de perfil.

Deve ter:
- título “Quem está assistindo?”;
- cards de perfil grandes;
- avatar com inicial;
- nome do perfil;
- opção Gerenciar futuramente.

### `/`

Home.

Deve ter:
- top navigation fixa;
- logo Zippy;
- links: Início, Filmes, Séries, Continuar, Minha Lista, Histórico;
- botão Buscar;
- botão Configurações;
- avatar do perfil;
- hero banner grande;
- botões: Assistir, Mais informações, Minha lista;
- seções horizontais:
  - Continuar assistindo;
  - Filmes adicionados recentemente;
  - Séries para maratonar;
  - Ação e aventura;
  - Minha lista.

### `/movies`

Tela de filmes.

Deve ter:
- título “Filmes”;
- filtros por gênero;
- grid de filmes;
- cards com poster, título, ano, gênero e progresso quando houver.

### `/series`

Tela de séries.

Deve ter:
- título “Séries”;
- seção “Continuar séries”;
- grid de séries;
- cards com poster, título, número de temporadas e progresso.

### `/movie/:id`

Detalhe do filme.

Deve ter:
- backdrop grande no fundo;
- gradiente escuro;
- título;
- ano;
- classificação;
- duração;
- gêneros;
- qualidade disponível;
- sinopse;
- elenco;
- direção;
- botões:
  - Assistir;
  - Continuar de onde parou;
  - Recomeçar;
  - Minha lista;
  - Assistir mais tarde.

### `/series/:id`

Detalhe da série.

Deve ter:
- backdrop grande;
- título;
- ano;
- quantidade de temporadas;
- sinopse;
- elenco;
- botão Continuar episódio atual;
- botão Recomeçar série;
- botão Minha lista;
- abas de temporadas;
- lista de episódios.

### `/series/:id/season/:seasonNumber`

Lista de episódios da temporada.

Cada episódio deve mostrar:
- imagem;
- número;
- nome;
- duração;
- sinopse curta;
- progresso;
- status assistido/não assistido.

### `/watch/:playableItemId`

Player.

Usar Shaka Player.

Deve ter:
- fullscreen;
- controles grandes;
- play/pause;
- voltar 10s;
- avançar 10s;
- barra de progresso;
- tempo atual;
- duração;
- menu de qualidade;
- menu de áudio;
- menu de legenda;
- botão episódios;
- botão sair;
- salvar progresso periodicamente;
- salvar progresso ao pausar;
- salvar progresso ao sair.

A API vai retornar uma URL HLS:

`/media-stream/{playableItemId}/master.m3u8`

### `/search`

Busca.

Deve ter:
- input grande;
- botão Digitar;
- botão Falar;
- botão Limpar;
- teclado visual;
- resultados em cards.

Busca por voz:
- usar Web Speech API;
- `window.SpeechRecognition || window.webkitSpeechRecognition`;
- idioma `pt-BR`;
- se não suportar, mostrar fallback para digitação;
- nunca quebrar em navegador de TV.

### `/my-list`

Minha lista.

Deve mostrar:
- Favoritos;
- Minha lista;
- Assistir mais tarde.

### `/continue`

Continuar assistindo.

Deve mostrar:
- conteúdos em andamento;
- barra de progresso;
- filme/série;
- posição aproximada.

### `/history`

Histórico.

Deve mostrar:
- histórico agrupado por dia;
- Hoje;
- Ontem;
- Semana passada.

### `/settings`

Configurações.

Deve ter:
- Conta;
- Perfis;
- Player;
- Legendas;
- Qualidade;
- Dispositivo;
- Aparência;
- Sair.

### `/error`

Tela de erro.

Deve mostrar:
- mensagem quando API/local server estiver offline;
- botão Tentar novamente.

## Componentes

Criar componentes reutilizáveis:

- AppShell
- TopNavigation
- HeroBanner
- ContentRow
- MediaCard
- MovieCard
- SeriesCard
- EpisodeCard
- ProfileCard
- Player
- PlayerControls
- QualityMenu
- SubtitleMenu
- AudioMenu
- SearchKeyboard
- VoiceSearchButton
- SettingsPanel
- LoadingScreen
- ErrorState

## Navegação TV/controle remoto

Implementar suporte a teclado:

- setas navegam entre itens;
- Enter seleciona;
- Escape/Backspace volta;
- Espaço controla play/pause no player.

Todo item clicável precisa ter `tabIndex` e foco visual claro.

O hover/focus dos cards deve fazer:
- leve scale;
- borda ou brilho;
- destaque visual forte.

## API esperada

Criar `src/services/api.ts`.

Endpoints:

Auth:
- `POST /api/auth/login`
- `POST /api/auth/pin-login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Profiles:
- `GET /api/profiles`
- `POST /api/profiles/select`

Home:
- `GET /api/home`

Media:
- `GET /api/media/movies`
- `GET /api/media/series`
- `GET /api/media/:id`
- `GET /api/media/:id/seasons`
- `GET /api/media/:id/seasons/:seasonNumber`

Playback:
- `GET /api/playback/:playableItemId`
- `POST /api/playback/:playableItemId/start`
- `POST /api/playback/:playableItemId/progress`
- `POST /api/playback/:playableItemId/finish`

Lists:
- `GET /api/lists`
- `POST /api/lists`
- `DELETE /api/lists/:id`

Search:
- `GET /api/search?q=`

Settings:
- `GET /api/settings`
- `PUT /api/settings`

## Estrutura sugerida

`src/components/layout`
`src/components/cards`
`src/components/player`
`src/components/search`
`src/components/settings`

`src/pages/Login`
`src/pages/Profiles`
`src/pages/Home`
`src/pages/Movies`
`src/pages/Series`
`src/pages/MovieDetail`
`src/pages/SeriesDetail`
`src/pages/Watch`
`src/pages/Search`
`src/pages/MyList`
`src/pages/ContinueWatching`
`src/pages/History`
`src/pages/Settings`

`src/services/api.ts`

`src/types/media.ts`
`src/types/user.ts`
`src/types/playback.ts`

`src/hooks/useRemoteNavigation.ts`
`src/hooks/usePlaybackProgress.ts`
`src/hooks/useVoiceSearch.ts`

`src/styles/globals.css`

## Mocks

Enquanto o backend não estiver pronto, criar mocks locais para:

- filmes;
- séries;
- episódios;
- perfis;
- progresso;
- listas;
- histórico;
- playback.

Os mocks devem permitir navegar por todas as telas.

## Resultado esperado

Entregar um frontend navegável, bonito, fluido, TV-first, visualmente próximo do protótipo Zippy, preparado para backend real e usando Shaka Player no player.
