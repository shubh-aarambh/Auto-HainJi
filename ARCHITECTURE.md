# Auto-HainJi – System Architecture & Design Choices

This document outlines the architectural decisions, design patterns, and future scope of the Auto-HainJi browser automation agent.

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
- **Registry Pattern**: The `ToolRegistry` aggregates registered tools and dynamically dispatches executions using string actions.

---

## 3. Hybrid Agent Planner Design
To optimize efficiency, cost, and reliability, we implemented a hybrid planning mechanism:
- **Deterministic Action Queue**: Standard objectives generate a high-speed initial queue that executes locally without calling external LLM APIs.
- **Heuristic Locator Resolution**: We scan the page DOM and score targets using a prioritizer (`SelectorRanker`) mapping labels to exact selectors.
- **AI Recovery (LLM fallback)**: If a step fails, the agent queries Groq (Llama), Gemini, or OpenAI Planners for recovery steps using the current DOM context, inserts those proposals back into the queue, and resumes execution.

---

## 4. Decoupled State & Event Bus Communication
We avoided monolithic controllers by decoupling subsystems through a Node `EventEmitter` subclass (`EventBus.ts`):
- **Publishers**: The `ExecutionEngine` and `AgentController` emit events (`STATE_CHANGED`, `STEP_COMPLETED`, `LOG_ADDED`).
- **Subscribers**: The WebSocket gateway subscribes to these events and pushes real-time JSON payloads to the frontend dashboard. The Winston Logger captures logs and streams them over the same Event Bus.

---

## 5. Session Database Persistence (Prisma + SQLite)
SQLite was selected as a light, zero-setup relational store. Using Prisma, we mapped out:
- **Session Table**: Stores Goal, starting/ending timestamps, and final execution state.
- **Step Table**: Stores each executed step (action, status, duration, retries, timestamp) and its static screenshot path inside the Next.js `public/` folder.
- **Replay Mode**: Enables fetching historical run histories and rendering step-by-step screenshot timelines.

---

## 6. UI/UX Design Decisions
To make the dashboard look highly professional and focused, we styled it with:
- **Telemetry-Focused Minimalist Dark Mode**: Deep `#050505` backgrounds with zinc borders to reduce eye strain.
- **Strict Layout Boundaries**: Terminals and logs are constrained physically to the screen to prevent unpredictable layout shifts and scrolling dead-ends.
- **No-Nonsense Controls**: We stripped out glassmorphic/neon aesthetics in favor of flat, high-contrast, functional interfaces resembling an engineering control deck.

---

## 7. Future Scope
- **Vision Model Integration**: Multimodal visual planner where the agent detects interactive coordinates using image object boxes directly from screenshots rather than parsing DOM coordinates.
- **Autonomous Multi-Step Navigation**: Self-directing agents that explore e-commerce search funnels, authenticate sessions, and checkout items dynamically.
- **Browser History & Memory**: Session cookie retention letting the agent persist login states across runs.
