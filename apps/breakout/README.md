# Breakout — Arcade Game

A modern, web-based implementation of the classic Breakout arcade game built with React, TypeScript, and Canvas. Features smooth physics, responsive paddle control, and engaging brick-breaking gameplay.

## Overview

**Breakout** is a fast-paced arcade game where players control a paddle to bounce a ball and destroy a grid of bricks. The goal is to clear all bricks without losing 3 lives. Built as part of the [OneTicket](https://github.com/dsissoko/oneticket-core) autonomous multi-agent framework demonstration.

### Key Features

- 🎮 **Classic Gameplay** — Destroy all bricks to win; lose 3 lives and it's game over
- 🏀 **Accurate Physics** — Realistic ball-to-paddle, ball-to-brick, and ball-to-wall collision detection
- ⚡ **Responsive Controls** — Smooth paddle movement with adjustable speed slider (0.5x–2.0x)
- 🎯 **Game States** — Playing, Paused, Victory, and Game Over screens
- 📊 **Live Feedback** — Real-time score and lives counter
- 🚀 **60 FPS Gameplay** — Smooth, fluidly animated experience
- 📱 **Responsive UI** — Works on desktop and mobile displays

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dsissoko/oneticket-core.git
   cd oneticket-core/apps/breakout/app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173` (or the URL shown in terminal)
   - Start playing!

## Playing the Game

### Controls

| Action | Input |
|--------|-------|
| **Move Paddle Left** | Mouse/Touch left of center OR Arrow Left |
| **Move Paddle Right** | Mouse/Touch right of center OR Arrow Right |
| **Adjust Speed** | Drag the speed slider (0.5x–2.0x) |
| **Pause/Resume** | Press `P` or click Pause button |
| **Restart** | Click Restart button or Game Over screen |

### Game Rules

1. **Objective** — Destroy all bricks using the paddle and ball
2. **Lives** — Start with 3 lives; lose one when the ball falls below the paddle
3. **Victory** — All bricks destroyed = you win! 🎉
4. **Game Over** — All lives lost = game ends
5. **Speed Control** — Adjust paddle speed during gameplay with the slider
6. **Ball Physics** — Ball bounces off paddle, bricks, and walls; no air resistance

### Example Gameplay Flow

1. Game starts with ball resting on paddle
2. Ball is released and moves upward
3. Ball bounces off bricks, destroying them
4. Paddle catches ball before it falls
5. Repeat until: victory (all bricks gone) or game over (no lives left)

## Development

### Project Structure

```
apps/breakout/
├── app/                              # Frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── screens/                 # Game screens (Game, Help, etc.)
│   │   ├── utils/                   # Game logic (collision detection)
│   │   ├── lib/                     # Utilities (logger, client, schemas)
│   │   └── api/                     # API integration
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── docs/                             # Product & architecture documentation
    ├── what/                         # Product specifications & user stories
    │   ├── product-spec.md           # High-level game requirements
    │   └── epics/                    # Decomposed features
    └── how/                          # Architecture & implementation
        ├── architecture.md           # Technical design
        ├── c4/                       # System context diagrams
        └── slices/                   # Implementation slices

```

### Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Build & Deploy
npm run build            # Build optimized production bundle
npm run preview          # Preview production build locally

# Quality
npm run lint             # Check code style and errors
npm run test             # Run all tests (unit + smoke)
npm run test:smoke       # Run smoke tests only
npm run coverage         # Generate test coverage report
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite 5 |
| **Styling** | Tailwind CSS 3 + shadcn/ui |
| **Testing** | Vitest + React Testing Library |
| **State Management** | React Hooks + TanStack Query |
| **Canvas** | HTML5 Canvas API (vanilla JS) |
| **Routing** | React Router v6 |
| **Forms** | React Hook Form + Zod validation |

### Game Architecture

**Canvas-based Game Loop:**
- **Render Loop** — 60 FPS frame updates via `requestAnimationFrame`
- **State Management** — Game state (paddle, ball, bricks) managed in React
- **Physics Engine** — Custom collision detection between game objects
- **Input Handling** — Mouse/keyboard controls integrated with game state

**Key Modules:**

- **`GameScreen.tsx`** — Main game component; renders canvas and UI
- **`collision.ts`** — Ball-to-paddle, ball-to-brick, ball-to-wall detection
- **`HelpScreen.tsx`** — Game instructions and rules
- **`api/client.ts`** — Optional backend integration

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Generate coverage report
npm run coverage
```

Tests cover:
- Collision detection logic
- Game state transitions
- UI component rendering
- Utility functions

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Product Specification](docs/what/product-spec.md)** — Game vision, goals, and success criteria
- **[Architecture](docs/how/architecture.md)** — Technical design and system overview
- **[User Stories](docs/what/epics/)** — Detailed requirements and acceptance criteria
- **[System Context (C4)](docs/how/c4/system-context.md)** — High-level system diagram
- **[Implementation Slices](docs/how/slices/)** — Decomposed development tasks

## Roadmap

| Phase | Goal | Status |
|-------|------|--------|
| **MVP** | Core gameplay (paddle, ball, bricks, lives) | ✅ Complete |
| **v0.2** | Levels & progression system | 🔄 Planned |
| **v0.3** | Power-ups & special effects | 🔄 Planned |
| **v1.0** | Full-featured arcade game | 🔄 Planned |

## Contributing

This project is managed by the [OneTicket](https://github.com/dsissoko/oneticket-core) autonomous multi-agent framework. To contribute:

1. Check open [issues](https://github.com/dsissoko/oneticket-core/issues) for the `breakout` tag
2. Comment `@po <request>` to trigger the agent framework (e.g., `@po add power-up system to Breakout`)
3. Agents will analyze, design, and implement your request autonomously
4. Review and merge the generated PR

## Troubleshooting

### Game won't start
- Ensure all dependencies are installed: `npm install`
- Check browser console for errors: `F12` → Console tab
- Try clearing browser cache: `Ctrl+Shift+Delete`

### Slow or laggy gameplay
- Close other browser tabs consuming resources
- Reduce browser zoom level: `Ctrl+-`
- Try a different browser (Chrome/Firefox recommended)
- Check CPU usage in Task Manager / Activity Monitor

### Controls not responding
- Click the game canvas to ensure it has focus
- Check that JavaScript is enabled in browser settings
- Try refreshing the page: `Ctrl+R`

## License

MIT — See [LICENSE](../../LICENSE) file in the root repository.

## Related Projects

- **[OneTicket Core](https://github.com/dsissoko/oneticket-core)** — The autonomous multi-agent framework
- **[AppShell](https://github.com/dsissoko/oneticket-core/tree/main/apps/appshell)** — Foundational app template
- **[Breakout Docs](./docs)** — Full specification and architecture

## Support

For issues, questions, or feedback:
- 📝 [Open an issue](https://github.com/dsissoko/oneticket-core/issues)
- 🤖 Comment `@po help with <topic>` to ask the agent framework
- 💬 Check existing [discussions](https://github.com/dsissoko/oneticket-core/discussions)

---

**Built with ❤️ by the OneTicket multi-agent framework**
