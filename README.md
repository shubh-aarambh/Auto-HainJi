# Auto-HainJi – Intelligent Website Automation Agent

Auto-HainJi is a production-quality website automation agent designed to autonomously control a browser and interact with websites. It features a high-contrast minimalist telemetry dashboard, modular Event Bus architecture, a Playwright resource manager, and a hybrid deterministic-AI planner with support for Groq (Llama), Gemini, and OpenAI.

---

## Key Features
1. **Hybrid Execution Flow**: Runs actions deterministically for speed and low cost, falling back to LLM planners (Groq/Gemini/OpenAI) only for recovery if actions fail.
2. **Event-Driven Architecture**: Decoupled Event Bus streams logs, step transitions, and state updates from the execution loop.
3. **Tool Registry Pattern**: Composable browser actions registered in a single registry, mimicking standard Agent SDKs.
4. **Step-by-Step Replay Mode**: SQLite database stores session records and screenshots. Visit `/replay` to view a timeline-based analysis of past sessions.
5. **Live Telemetry UI**: A professional, low-latency telemetry interface featuring hardware-like strict layout bounds and high-contrast styling for deep focus.
6. **Real-time Streaming**: Custom Next.js instrumentation loads a standalone WebSocket server at startup, streaming actions to the client.

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Add your AI Planner keys
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Database Migrations
Initialize the SQLite database schema:
```bash
npx prisma db push
```

---

## Running the Application

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:4001](http://localhost:4001) in your browser.

---

## Example Workflow

1. The agent launches a browser, navigates to the target URL.
2. The DOM is analyzed via `DomDetector`, and elements are matched dynamically based on priority heuristics.
3. Real-time Winston logs stream in the Terminal Telemetry log card.
4. Screenshots are taken after each action and displayed dynamically in the UI.
5. The session details are saved to SQLite. Visit the **Replay Studio** in the sidebar to review the step-by-step history!
