# PROMPT CODEX — ZIPPY + JELLYFIN

## Objetivo

Adaptar o Zippy para usar o Jellyfin como backend/media server.

Antes o projeto estava indo para:
- banco próprio;
- scanner próprio;
- TMDB próprio;
- FFmpeg próprio;
- backend completo.

Agora a decisão é:

**Jellyfin cuida de mídia, catálogo, scanner, metadados, progresso e streaming.**
**Zippy fica como frontend bonito, TV-first, usando a API do Jellyfin.**

Não criar banco próprio para catálogo.
Não criar scanner próprio.
Não criar worker TMDB.
Não criar worker FFmpeg.
Não criar migration PostgreSQL neste momento.

---

## Stack

Frontend:
- React
- Vite
- TypeScript
- React Router
- Shaka Player
- CSS próprio
- Web Speech API para busca por voz com fallback

Backend:
- O backend .NET é opcional no MVP.
- Se já existir backend .NET, manter apenas como opcional/proxy futuro.
- Não duplicar regras do Jellyfin no backend.

---

## Arquitetura alvo

MVP:

Zippy Frontend
→ Jellyfin API
→ Jellyfin Server
→ Filmes/Séries no PC

Futuro opcional:

Zippy Frontend
→ Zippy Backend Proxy
→ Jellyfin API

---

## Configuração inicial

Criar tela de login/configuração pedindo:

- URL do Jellyfin Server
  Exemplo: `http://192.168.0.25:8096`
- usuário
- senha

Após autenticar, salvar localmente:
- `serverUrl`
- `accessToken`
- `userId`
- `deviceId`

Não hardcodar servidor.

---

## Serviço principal

Criar:

`src/services/jellyfinApi.ts`

Esse serviço deve cuidar de:

- autenticação;
- token;
- usuário atual;
- bibliotecas;
- filmes;
- séries;
- temporadas;
- episódios;
- imagens;
- continuar assistindo;
- favoritos;
- busca;
- detalhes;
- playback;
- progresso;
- URL de imagem;
- URL de stream.

---

## Rotas

Manter/criar:

- `/login`
- `/profiles`
- `/`
- `/movies`
- `/series`
- `/movie/:id`
- `/series/:id`
- `/series/:id/season/:seasonNumber`
- `/watch/:itemId`
- `/search`
- `/my-list`
- `/continue`
- `/history`
- `/settings`
- `/error`

---

## Login

A tela `/login` deve pedir:

- Jellyfin Server URL;
- usuário;
- senha.

Após login:
- autenticar no Jellyfin;
- salvar token;
- salvar userId;
- ir para `/`.

Se falhar:
- mostrar erro amigável.

Se já tiver token salvo:
- tentar carregar home automaticamente.

---

## Home

A home deve usar dados reais do Jellyfin.

Seções:

- Continuar assistindo
- Filmes adicionados recentemente
- Séries adicionadas recentemente
- Filmes
- Séries
- Favoritos
- Em destaque

Manter visual premium do Zippy:
- hero grande;
- cards;
- carrosséis;
- fundo escuro;
- vermelho principal.

---

## Filmes

Tela `/movies`:

Buscar filmes no Jellyfin.

Mostrar:
- poster;
- título;
- ano;
- gênero;
- progresso;
- favorito.

---

## Séries

Tela `/series`:

Buscar séries no Jellyfin.

Mostrar:
- poster;
- título;
- ano;
- temporadas/episódios se disponível;
- progresso.

---

## Detalhe do filme

Tela `/movie/:id`:

Mostrar:
- backdrop;
- poster;
- título;
- ano;
- duração;
- classificação;
- gêneros;
- sinopse;
- elenco se disponível;
- botão Assistir;
- botão Continuar;
- botão Recomeçar;
- botão Favorito.

---

## Detalhe da série

Tela `/series/:id`:

Mostrar:
- backdrop;
- título;
- ano;
- sinopse;
- temporadas;
- episódios;
- botão Continuar;
- botão Favorito.

Cada episódio deve mostrar:
- imagem;
- número;
- nome;
- duração;
- sinopse;
- progresso;
- assistido/não assistido.

---

## Player

Tela `/watch/:itemId`.

O player deve:

- buscar playback no Jellyfin;
- obter URL de stream;
- tentar Shaka Player quando for HLS/DASH compatível;
- usar `<video>` como fallback;
- manter controles customizados do Zippy;
- salvar progresso no Jellyfin;
- reportar início, progresso e fim quando possível.

Controles:

- play/pause;
- voltar 10s;
- avançar 10s;
- barra de progresso;
- tempo atual;
- duração;
- qualidade;
- áudio;
- legenda;
- sair;
- próximo episódio quando existir.

Salvar progresso:

- ao iniciar;
- a cada 10 segundos;
- ao pausar;
- ao sair;
- ao finalizar.

---

## Busca

Tela `/search`.

Deve ter:

- input grande;
- botão Digitar;
- botão Falar;
- botão Limpar;
- teclado visual;
- resultados em cards.

Busca por voz:

- usar Web Speech API;
- idioma `pt-BR`;
- fallback se não suportar;
- não quebrar em navegador de TV.

---

## Minha lista / favoritos

Usar favoritos do Jellyfin.

Tela `/my-list`:
- favoritos;
- itens marcados;
- continuar assistindo, se fizer sentido.

Se Jellyfin não tiver “assistir mais tarde” separado, usar favorito no MVP.

---

## Histórico

Usar dados disponíveis do Jellyfin:

- itens assistidos;
- itens com progresso;
- itens recentes.

Não criar banco próprio para histórico agora.

---

## Settings

Tela `/settings`:

Mostrar:
- URL do servidor Jellyfin;
- usuário logado;
- botão Testar conexão;
- botão Desconectar;
- limpar sessão local;
- status do servidor;
- preferências visuais locais.

---

## Layout

Manter o visual do protótipo Zippy.

Obrigatório:

- fundo preto;
- vermelho `#e50914`;
- hero grande;
- backdrop com gradiente;
- cards grandes;
- carrosséis horizontais;
- hover/focus com scale;
- foco visível para controle remoto;
- textos grandes;
- animações suaves;
- TV-first;
- responsivo para 55” e 65”.

---

## Navegação TV

Implementar:

- setas navegam;
- Enter seleciona;
- Escape/Backspace volta;
- Espaço play/pause;
- foco visual claro em todo item clicável.

---

## Backend .NET existente

Se o backend .NET já foi criado:

- não apagar sem necessidade;
- não continuar banco próprio;
- não criar scanner próprio;
- deixar como opcional;
- criar no máximo `/api/health`;
- preparar para proxy futuro se necessário.

Para o MVP, o frontend pode falar direto com Jellyfin.

---

## Resultado esperado

Ao final:

- Zippy abre no navegador.
- Usuário informa URL do Jellyfin, usuário e senha.
- Zippy autentica no Jellyfin.
- Home carrega catálogo real.
- Filmes e séries aparecem com capas.
- Detalhes funcionam.
- Busca funciona.
- Player toca pelo Jellyfin.
- Progresso salva no Jellyfin.
- Interface continua bonita, fluida e TV-first.
