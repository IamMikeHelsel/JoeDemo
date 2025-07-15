# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repository contains 3 demo projects showcasing different prototyping approaches:

1. **demo_1/** - Rust backend with HTML/JS frontend
   - Actix web server serving static files from `frontend/`
   - Simple battleship game backend in Rust

2. **demo_2_claude/** - React goal breakdown app
   - Single TSX file with complete goal breakdown application
   - Uses Claude API integration for AI-powered task breakdown

3. **demo_3_battleship/** - React/TypeScript battleship game
   - Full-featured AI battleship arena with Gemini integration
   - Uses Vite for build tooling

## Development Commands

### Demo 1 (Rust/HTML)
```bash
cd demo_1
cargo run  # Starts server at http://127.0.0.1:8080
```

### Demo 3 (React/TypeScript Battleship)
```bash
cd demo_3_battleship/ai-battleship-arena
npm install
npm run dev    # Development server
npm run build  # Production build
npm run preview # Preview production build
```

### Demo 2 (React Goal Breakdown)
No specific build commands - single TSX file intended for integration

## Key Architecture

### Demo 1 Structure
- `src/main.rs`: Actix web server with static file serving
- `frontend/`: Static HTML/CSS/JS files
- Uses Rust for backend, vanilla JavaScript for frontend

### Demo 3 Architecture
- `App.tsx`: Main game component with state management
- `components/`: Reusable UI components (GameGrid, GameOverModal, Icons)
- `services/geminiService.ts`: AI move generation via Gemini API
- `types.ts`: TypeScript definitions for game entities
- `constants.ts`: Game configuration (grid size, ships)

### Demo 2 Structure
- Single file React component with AI integration
- Uses window.claude API for task breakdown
- Hierarchical task management with time estimation

## Environment Setup

### Demo 3 requires:
- `GEMINI_API_KEY` environment variable in `.env.local`
- Node.js for development

### Demo 1 requires:
- Rust toolchain with Cargo

## Testing and Linting

No specific test or lint commands are configured in the package.json files. TypeScript compilation serves as the primary validation for Demo 3.