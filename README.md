# Fusion AI Studio 🚀

**Fusion AI Studio** is a state-of-the-art, full-stack AI-assisted Cloud IDE and real-time collaboration workspace platform. It enables developers to scaffold, edit, preview, debug, and collaborate on multi-file codebases in real time with Google Gemini-powered AI assistance and interactive web container execution.

---

## 🌟 Key Features

### 🖥️ Frontend (Next-Gen Cloud IDE)
- **Activity Bar & Resizable Panes**: VS Code-inspired layout with Activity Bar, Explorer, In-File Search, Source Control, and AI Copilot.
- **Monaco-Grade Code Editor**:
  - Live syntax highlighting for JavaScript, JSX, Python, HTML, CSS, and JSON.
  - Line numbering, active line highlight, minimap navigation, search & replace, and code beautification.
  - Multi-tab management with close actions and dirty indicators.
- **Real-Time Collaboration**:
  - Live presence indicators with green pulsing indicators showing who is currently online in the workspace.
  - Real-time collaborative file synchronization over Socket.IO (`file-change`, `file-create`, `file-delete`).
  - Team chat channel directly integrated alongside AI Copilot.
- **Full AI Copilot Suite**:
  - Contextual code generation, refactoring, security auditing, explanation, and unit test generation.
  - One-click **Apply to Editor**, **Create New File**, **Copy Code**, and **Insert at Cursor** actions.
  - Interactive mode selector: *Auto Copilot*, *Refactor*, *Unit Tests*, *Debug*, and *Architecture Explanation*.
- **Interactive Cloud Terminal**:
  - Simulated shell supporting `npm start`, `npm test`, `npm run build`, `node <file>`, `ls`, `cat <file>`, `touch <file>`, `rm <file>`, `ai <prompt>`, `export`, and `help`.
- **Live Sandboxed Web Preview**:
  - Isolated HTML/JS/CSS live rendering container.
  - Responsive viewport mode switcher: Desktop (100%), Tablet (768px), and Mobile (375px).
  - Built-in **Console** tab capturing logs and errors directly from the preview iframe.
- **Cloud Auto-Save & Manual Sync**:
  - Debounced auto-save with visual status indicators (*● Saved*, *Saving...*, *● Unsaved changes*).
  - Global `Cmd+S` / `Ctrl+S` cloud sync shortcut.
  - One-click workspace JSON bundle export.

### ⚙️ Backend (Resilient Node.js / Express / Socket.IO Engine)
- **Full AI Assistant Service (`/api/v1/ai/prompt`)**:
  - Native Google Gemini AI integration with support for `GEMINI_API_KEY` and `GOOGLE_AI_KEY`.
  - Resilient, context-aware fallback engine that guarantees immediate, intelligent code recommendations even offline or during API rate limits.
- **Workspace File & State Persistence**:
  - Projects store multi-file file trees, descriptions, template types, and member access in MongoDB Atlas.
  - Endpoints for `GET/PUT /api/v1/projects/:projectId/files`, `DELETE /api/v1/projects/:projectId`, and metadata updates.
- **Starter Framework Templates**:
  - **Node.js Express API**: REST endpoints with live web preview.
  - **React + Vite**: Interactive component state counter.
  - **Python Flask API**: Microservice endpoint sandbox.
  - **Creative Canvas Web**: Interactive particle cloud physics.
- **Real-Time Socket.IO Collaboration**:
  - Room presence tracking (`room-users`, `user-joined`, `user-left`).
  - Broadcast of `file-change`, `file-create`, `file-delete`, and `user-typing`.
  - Chat message persistence across sessions in MongoDB.
- **Enterprise-Grade Security & Resilience**:
  - JWT authentication with fast token lookups.
  - Redis token blacklisting with automatic in-memory fallback.
  - Health check endpoints at `/api/health` and `/api/v1/health` providing MongoDB, Redis, and server metrics.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Remix Icon, Axios, Socket.IO Client, React Router DOM v7.
- **Backend**: Node.js (ES Modules), Express 5, MongoDB Atlas (Mongoose 9), Redis (ioredis), Socket.IO 4, `@google/generative-ai`, JWT, Bcrypt.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas connection string
- (Optional) Redis instance & Google Gemini API key

### 2. Backend Setup
```bash
cd Backend
npm install
npm run dev
```
The server will start on port `3000`. Test the health check at:
```bash
curl http://localhost:3000/api/health
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/users/register` | Register new user account |
| `POST` | `/api/v1/users/login` | Login user & issue JWT |
| `GET` | `/api/v1/users/logout` | Invalidate session & blacklist token |
| `GET` | `/api/v1/users/all` | List registered collaborators |
| `GET` | `/api/v1/projects/all` | List user's active workspaces |
| `POST` | `/api/v1/projects/create` | Create workspace with chosen template |
| `GET` | `/api/v1/projects/:id/files` | Load workspace files from cloud |
| `PUT` | `/api/v1/projects/:id/files` | Save/auto-save workspace files |
| `PUT` | `/api/v1/projects/add-user` | Invite collaborators to workspace |
| `PUT` | `/api/v1/projects/:id` | Rename / update workspace metadata |
| `DELETE` | `/api/v1/projects/:id` | Delete workspace permanently |
| `POST` | `/api/v1/ai/prompt` | AI Copilot code generation & audit |
| `GET` | `/api/health` | System health check (DB, Redis, Uptime) |
