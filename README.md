# AutoPilot AI – Intelligent Website Automation Agent

AutoPilot AI is a production-quality website automation agent designed to autonomously control a browser and interact with websites. It features a modern, high-fidelity UI dashboard, modular Event Bus architecture, a Playwright resource manager, and a hybrid deterministic-AI planner.

---

## Key Features
1. **Hybrid Execution Flow**: Runs actions deterministically for speed and low cost, falling back to OpenAI/Gemini planners only for recovery if actions fail.
2. **Event-Driven Architecture**: Decoupled Event Bus streams logs, step transitions, and state updates from the execution loop.
3. **Tool Registry Pattern**: Composable browser actions registered in a single registry, mimicking OpenAI Agents SDK.
4. **Step-by-Step Replay Mode**: SQLite database stores session records and screenshots. Visit `/replay` to step through past sessions.
5. **Premium SaaS UI/UX**: Dark theme featuring Glassmorphic cards, mouse spotlight tracking, and high-fidelity custom buttons (Shiny, Aurora, Neon, Magnetic, Border Beam, and Ripple).
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
# Add your AI Planner keys (Gemini recommended)
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

Start the Next.js development server (this automatically boots the WebSocket server on port 3001 via Next.js instrumentation):
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Example Workflow

1. Click **Start Agent** on the Dashboard.
2. The agent launches a browser, navigates to the target URL (e.g. `https://ui.shadcn.com/docs/forms/react-hook-form`).
3. The DOM is analyzed via `DomDetector`, and elements are matched dynamically based on priority heuristics:
   - Name field is located and filled.
   - Description field is located and filled.
   - The Submit button is clicked.
4. Real-time Winston logs stream in the Terminal log card.
5. Screenshots are taken after each action and displayed dynamically in the UI.
6. The session details are saved to SQLite. Visit the **Replay Viewer** in the sidebar to review the step-by-step history!
