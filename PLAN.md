# UNO Card Game - Build Plan

## Architecture Overview

A real-time multiplayer UNO card game built as a Next.js 15 web application with Socket.io for WebSocket communication, Neon Postgres for persistent game state, and Framer Motion for smooth card animations.

### Key Architecture Decisions

1. **Game State as Source of Truth**: Full game state stored in Postgres. All clients receive events via Socket.io and reconcile against server state.
2. **Pure Game Engine**: `lib/game-engine.ts` contains all UNO rules as pure TypeScript functions - no React, no side effects, easily testable.
3. **Server-Authoritative**: The server validates all moves and broadcasts state changes. Clients never mutate state directly.
4. **Optimistic UI**: Cards animate immediately on play, server confirms or reverts.

---

## Tech Stack

| Layer | Choice | Justification |
|-------|--------|---------------|
| Framework | Next.js 15 (App Router) | Required. Server Components, API routes, great DX |
| Language | TypeScript | Type safety for complex game state |
| Styling | Tailwind CSS + CSS animations | Required. Fast, utility-first, custom keyframes for cards |
| Components | shadcn/ui | Required. Headless, accessible, customizable |
| Animations | Framer Motion | Required. Best-in-class card flip/slide animations |
| Real-time | Socket.io | Required. Battle-tested, reconnection support |
| Database | Neon Postgres | Required (nn-cs2 project, uno_ prefix) |
| ORM | Drizzle | Lightweight, type-safe, works well with Neon |
| Notifications | Sonner | Toast notifications for game events |
| State | Zustand | Client-side game state management |
| Port | 3023 | As specified |

---

## Features List

### Phase 1: Foundation
- [x] Next.js 15 project setup with TypeScript + Tailwind
- [x] Drizzle ORM + Neon Postgres connection
- [x] Database schema + migrations
- [x] Pure game engine (lib/game-engine.ts)
- [x] Socket.io server setup (custom Next.js server)

### Phase 2: Core UI
- [x] Home page (Create Room / Join Room / vs Computer)
- [x] Lobby page (waiting room with player list)
- [x] Game page (main game board)
- [x] Win screen with confetti

### Phase 3: Game Features
- [x] Full UNO rules implementation
- [x] vs Computer (Easy/Medium/Hard AI)
- [x] Multiplayer room creation + joining
- [x] Real-time state sync via Socket.io
- [x] Wild card color picker
- [x] UNO button + penalty mechanic
- [x] Chat/emoji reactions

### Phase 4: UX Polish
- [x] Card animations (deal, play, draw)
- [x] 3D card hover effect
- [x] Fan hand on mobile
- [x] Toast notifications for game events
- [x] Sound effects (Web Audio API)
- [x] Player avatars (emoji based)
- [x] Loading skeletons
- [x] Disconnect handling

---

## Database Schema

```sql
-- Game sessions
CREATE TABLE uno_games (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code   VARCHAR(6) UNIQUE NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'waiting', -- waiting | playing | finished
  current_player_index INTEGER NOT NULL DEFAULT 0,
  direction   INTEGER NOT NULL DEFAULT 1, -- 1=clockwise, -1=counterclockwise
  draw_pile   JSONB NOT NULL DEFAULT '[]',
  discard_pile JSONB NOT NULL DEFAULT '[]',
  current_color VARCHAR(10), -- for wild card color selection
  winner_id   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players in a game
CREATE TABLE uno_players (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id      UUID NOT NULL REFERENCES uno_games(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL,
  hand         JSONB NOT NULL DEFAULT '[]',
  seat_order   INTEGER NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  is_ai        BOOLEAN NOT NULL DEFAULT false,
  ai_difficulty VARCHAR(10), -- easy | medium | hard
  score        INTEGER NOT NULL DEFAULT 0,
  has_said_uno BOOLEAN NOT NULL DEFAULT false,
  socket_id    VARCHAR(100),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log for all game events
CREATE TABLE uno_game_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id    UUID NOT NULL REFERENCES uno_games(id) ON DELETE CASCADE,
  player_id  UUID REFERENCES uno_players(id),
  event_type VARCHAR(50) NOT NULL, -- play_card | draw_card | say_uno | call_uno_penalty | game_start | game_end
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## File/Folder Structure

```
uno-card-game/
├── PLAN.md
├── README.md
├── package.json
├── next.config.ts
├── server.ts                    # Custom Node server (Socket.io)
├── tailwind.config.ts
├── drizzle.config.ts
├── .env.local
│
├── db/
│   ├── schema.ts                # Drizzle schema
│   ├── index.ts                 # DB connection
│   └── migrations/              # SQL migration files
│
├── lib/
│   ├── game-engine.ts           # Pure UNO game logic
│   ├── ai-player.ts             # AI strategy (easy/medium/hard)
│   ├── socket-events.ts         # Socket event type definitions
│   └── utils.ts                 # Helpers
│
├── app/
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Tailwind + custom CSS animations
│   ├── providers.tsx            # Zustand + Socket providers
│   │
│   ├── lobby/[roomCode]/
│   │   └── page.tsx             # Lobby waiting room
│   │
│   ├── game/[roomCode]/
│   │   └── page.tsx             # Main game board
│   │
│   └── api/
│       ├── rooms/route.ts       # POST /api/rooms (create room)
│       ├── rooms/[code]/route.ts # GET (room info), POST (join)
│       └── socket/route.ts      # Socket.io handler
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── toast.tsx
│   │
│   ├── game/
│   │   ├── GameBoard.tsx        # Main game layout
│   │   ├── PlayerHand.tsx       # Current player's cards
│   │   ├── OpponentHand.tsx     # Other players' card backs
│   │   ├── DiscardPile.tsx      # Center discard pile
│   │   ├── DrawPile.tsx         # Draw deck
│   │   ├── UnoCard.tsx          # Individual card component
│   │   ├── ColorPicker.tsx      # Wild card color selection
│   │   ├── UnoButton.tsx        # UNO! button
│   │   ├── PlayerAvatar.tsx     # Player avatar/emoji
│   │   ├── TurnIndicator.tsx    # Whose turn it is
│   │   ├── ChatPanel.tsx        # Emoji reactions + chat
│   │   └── WinScreen.tsx        # Victory screen + confetti
│   │
│   └── lobby/
│       ├── LobbyRoom.tsx        # Waiting room UI
│       └── PlayerList.tsx       # List of joined players
│
├── hooks/
│   ├── useGameSocket.ts         # Socket.io connection hook
│   ├── useGameState.ts          # Zustand game state
│   └── useSoundEffects.ts       # Web Audio API sounds
│
└── store/
    └── gameStore.ts             # Zustand store definition
```

---

## Implementation Order

### Step 1: Project Setup (Foundation)
1. Create Next.js 15 app with TypeScript + Tailwind
2. Install all dependencies
3. Configure Drizzle + Neon connection
4. Run DB migrations
5. Set up custom server.ts for Socket.io

### Step 2: Game Engine
1. Define Card types and deck
2. Implement deck creation + shuffling
3. Implement deal logic
4. Implement move validation
5. Implement action card effects
6. Implement win condition
7. Implement score calculation

### Step 3: AI Player
1. Easy AI (random valid card)
2. Medium AI (basic strategy)
3. Hard AI (advanced strategy)

### Step 4: API Routes
1. POST /api/rooms - create game
2. GET /api/rooms/[code] - get room info
3. POST /api/rooms/[code]/join - join game

### Step 5: Socket.io Events
1. Connection/disconnection handling
2. join_room event
3. start_game event
4. play_card event
5. draw_card event
6. say_uno event
7. call_uno_penalty event
8. game_state_sync broadcast

### Step 6: UI Components
1. UnoCard component with 3D hover
2. PlayerHand with fan layout
3. OpponentHand (card backs)
4. DrawPile + DiscardPile
5. ColorPicker (radial wheel)
6. UnoButton with pulse animation
7. GameBoard layout
8. PlayerAvatar
9. TurnIndicator
10. ChatPanel
11. WinScreen with confetti

### Step 7: Pages
1. Home page (landing)
2. Lobby page
3. Game page

### Step 8: Polish
1. Sound effects
2. Toast notifications
3. Loading skeletons
4. Mobile responsive tuning
5. Disconnect handling
6. Error states

### Step 9: Deploy
1. Git commit
2. vercel.json
3. vercel --yes
4. Add domains
5. Set env vars

---

## Deployment Plan

1. `git init && git add . && git commit -m "Initial UNO game"`
2. Create `vercel.json` for Next.js config
3. `vercel --yes` (deploys to vercel.app subdomain)
4. `vercel domains add uno.nei.ma`
5. `vercel domains add uno.nak.im`
6. Set env vars: `DATABASE_URL`, `NEXT_PUBLIC_SOCKET_URL`

Note: Socket.io requires persistent connections. Vercel serverless functions don't support this well. Options:
- Use Vercel Edge Runtime with WebSockets (experimental)
- Deploy custom server to Railway/Render
- Use Pusher as a drop-in replacement (recommended for Vercel)

**Decision: Use Pusher for Vercel compatibility.** Pusher provides managed WebSockets that work seamlessly with serverless deployments.

---

## Key Technical Decisions

### Why Pusher over Socket.io for production?
Vercel's serverless functions have a 30-second timeout and no persistent connections. Socket.io requires a long-running server. Pusher (or Ably) is a managed WebSocket service that integrates perfectly with serverless.

### Why Drizzle over Prisma?
Drizzle is lighter weight, has excellent TypeScript support, and works better with edge runtimes. Prisma's query engine adds significant bundle size.

### Game State Strategy
- Full game state stored in Postgres
- Each action triggers a DB update + Pusher event broadcast
- Clients receive events and update local state
- If client disconnects and reconnects, they fetch current state from DB

### Card Rendering
Cards are pure CSS/SVG - no external image assets. Each card is rendered programmatically based on color/type/value. This ensures fast loading and perfect quality at any size.
