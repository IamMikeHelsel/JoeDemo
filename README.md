# JoeDemo
A set of 3 demos showing the state of prototyping apps these days. Each demo showcases different approaches to rapid application development using modern tools and frameworks.

## Demo 1: Rust Backend with HTML/JS Frontend
**Location:** `demo_1/`

A simple battleship game backend built with Rust and Actix Web, serving static HTML/CSS/JS files. Demonstrates how to quickly set up a web server with file serving capabilities.

**Tech Stack:**
- Rust with Actix Web framework
- Static HTML/CSS/JavaScript frontend
- Cargo for dependency management

**To run:**
```bash
cd demo_1
cargo run
```
Then open http://127.0.0.1:8080 in your browser.

## Demo 2: AI-Powered Goal Breakdown App
**Location:** `demo_2_claude/`

A React application that breaks down high-level goals into actionable tasks using AI. Features hierarchical task management with time estimation and confidence levels.

**Tech Stack:**
- React with TypeScript
- Claude API integration
- Tailwind CSS for styling
- Lucide React icons

**Features:**
- AI-powered task breakdown
- Time estimation with confidence intervals
- Hierarchical task structure
- Manual task editing and management

**To run:**
This is a single TSX file intended for integration into a larger React application. It requires the Claude API to be available via `window.claude`.

## Demo 3: AI Battleship Arena
**Location:** `demo_3_battleship/ai-battleship-arena/`

A full-featured battleship game with AI opponent powered by Google's Gemini AI. Features both Player vs AI and Player vs Player modes.

**Tech Stack:**
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Google Gemini AI integration

**Features:**
- Interactive ship placement with drag preview
- AI opponent with strategic gameplay
- Player vs Player mode
- Responsive design
- Real-time game state management

**To run:**
```bash
cd demo_3_battleship/ai-battleship-arena
npm install
```

Create a `.env.local` file and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

Then start the development server:
```bash
npm run dev
```

**Additional commands:**
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Getting Started

Each demo is self-contained and can be run independently. Choose the demo that best fits your learning goals:

- **Demo 1** for Rust backend development
- **Demo 2** for AI integration patterns
- **Demo 3** for full-stack React applications with AI

## Prerequisites

- **Demo 1:** Rust toolchain (install from https://rustup.rs/)
- **Demo 2:** Integration into existing React app
- **Demo 3:** Node.js and npm, plus Gemini API key
