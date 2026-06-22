# AutoPilot AI – System Architecture & Design Choices

This document outlines the architectural decisions, design patterns, and future scope of the AutoPilot AI browser automation agent.

---

## 1. Why Playwright Was Chosen
Playwright was chosen over Puppeteer, Selenium, and Cypress due to the following enterprise-grade benefits:
- **Multi-Browser support**: Runs natively on Chromium, Firefox, and WebKit without configuration friction.
- **Auto-Wait Heuristics**: Reduces flaky testing by automatically waiting for actions (clicks, key typing) to be actionable.
- **Robust Locators**: Exposes rich element search engines including layouts, tags, and accessibility hooks (ARIA labels).
- **Automation Bypass**: Enables bypassing bot detection mechanisms (e.g. Chrome DevTools Protocol overrides) out of the box.

---

## 2. Tool-Based Architecture (Tool Registry Pattern)
We decoupled every browser operation into isolated classes implementing a common `Tool` interface.
- **Decoupled Actions**: `openBrowser.ts`, `navigateToUrl.ts`, `sendKeys.ts`, `scroll.ts`, `clickOnScreen.ts`, `takeScreenshot.ts`, `closeBrowser.ts` are completely independent.
- **Registry Pattern**: The `ToolRegistry` aggregates registered tools and dynamically dispatches executions using string actions (e.g. `toolRegistry.execute("send_keys", args, context)`).
- **OpenAI Agent Compatibility**: This design matches the OpenAI Agents SDK schema, making it simple to map system proposals directly to tool parameters.

---

## 3. Hybrid Agent Planner Design
To optimize efficiency, cost, and reliability, we implemented a hybrid planning mechanism:
- **Deterministic Action Queue**: Standard objectives (e.g., form submissions) generate a high-speed initial queue that executes locally without calling external LLM APIs.
- **Heuristic Locator Resolution**: We scan the page DOM and score targets using a prioritizer (`SelectorRanker`) mapping labels (like "Name" or "Submit") to exact selectors.
- **AI Recovery (LLM fallback)**: If a step fails or a selector goes missing, the agent halts, queries OpenAI/Gemini Planners for recovery steps using the current DOM context, inserts those proposals back into the queue, and resumes execution.

---

## 4. Decoupled State & Event Bus Communication
We avoided monolithic controllers by decoupling subsystems through a Node `EventEmitter` subclass (`EventBus.ts`) using a strongly typed `AgentEvent` enum:
- **Publishers**: The `ExecutionEngine` and `AgentController` emit events (`STATE_CHANGED`, `STEP_COMPLETED`, `LOG_ADDED`).
- **Subscribers**: The WebSocket gateway (`server/websocket.ts`) subscribes to these events and pushes real-time JSON payloads to the frontend dashboard. The Winston Logger captures logs and streams them over the same Event Bus.

---

## 5. Session Database Persistence (Prisma + SQLite)
SQLite was selected as a light, zero-setup relational store. Using Prisma, we mapped out:
- **Session Table**: Stores Goal, starting/ending timestamps, and final execution state.
- **Step Table**: Stores each executed step (action, status, duration, retries, timestamp) and its static screenshot path inside the Next.js `public/` folder.
- **Replay Mode**: Enables fetching historical run histories and rendering step-by-step screenshot timelines.

---

## 6. UI/UX Design Decisions
To make the dashboard look like a premium SaaS dashboard (Cursor, Claude Desktop, Vercel), we styled it with:
- **Deep Slate Palette**: Monochromatic backgrounds `#09090B` with purple highlights (`#7C3AED`) representing intelligence.
- **Glassmorphism**: Cards styled with backdrop blurs and subtle reflections.
- **Spotlight Hover**: Card mouse trackers creating glowing gradient overlays.
- **Animated Controls**: High-fidelity custom buttons (ShinyButton sheen sweep, MagneticButton cursor attraction, AuroraButton flowing gradients, BorderBeam rotating conic beams, and RippleButton tap triggers).

---

## 7. Future Scope
- **Vision Model Integration**: Multimodal visual planner where the agent detects interactive coordinates using image object boxes directly from screenshots rather than parsing DOM coordinates.
- **Autonomous Multi-Step Navigation**: Self-directing agents that explore e-commerce search funnels, authenticate sessions, and checkout items dynamically.
- **Browser History & Memory**: Session cookie retention letting the agent persist login states across runs.
- **Task Memory**: Retaining a knowledge graph of previous successes/failures on specific websites to speed up future matching.
