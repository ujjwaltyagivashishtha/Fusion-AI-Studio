import mongoose from "mongoose";
import projectModel from "../models/project.model.js";

export const PROJECT_TEMPLATES = {
  "node-express": {
    "app.js": `// Fusion AI Studio - Express Application Server
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'Operational',
    service: 'Fusion AI Workspace Engine',
    version: '2.5.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, memory: '142MB', latency: '1.2ms' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running smoothly on port \${PORT}\`);
});`,
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fusion AI Web Preview</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🚀 Fusion Live Web Container</h1>
      <span class="badge">● Online</span>
    </div>
    <p>
      Your full-stack application preview is executing and live-rendering inside our isolated cloud environment.
    </p>
    <button class="btn" onclick="alert('Container response OK!')">Test Cloud Interaction</button>
  </div>
</body>
</html>`,
    "style.css": `/* Workspace Global Stylesheet */
:root {
  --primary: #3b82f6;
  --bg-dark: #080c14;
}

body {
  margin: 0;
  padding: 2rem;
  background-color: var(--bg-dark);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #f8fafc;
}

.card {
  background: rgba(30, 41, 59, 0.45);
  padding: 2rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6);
  max-width: 600px;
  margin: 2rem auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h1 {
  color: #60a5fa;
  font-size: 1.5rem;
  margin: 0;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

p {
  color: #94a3b8;
  line-height: 1.6;
}

.btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}`,
    "package.json": `{
  "name": "fusion-ai-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`
  },
  "react-vite": {
    "src/App.jsx": `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="container">
      <div className="card">
        <h1>⚡ React + Vite Workspace</h1>
        <p>Real-time full-stack development with Fusion AI Studio.</p>
        <button className="counter-btn" onClick={() => setCount((c) => c + 1)}>
          Clicked {count} times
        </button>
      </div>
    </div>
  );
}`,
    "src/main.jsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fusion React Workspace</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    "src/style.css": `body {
  margin: 0;
  background: #080c14;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 1.5rem;
  text-align: center;
}
h1 { color: #38bdf8; }
.counter-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #0284c7;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: bold;
}`,
    "package.json": `{
  "name": "fusion-react-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`
  },
  "python-flask": {
    "app.py": `from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "service": "Fusion AI Python Microservice",
        "version": "1.0.0"
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    payload = request.get_json() or {}
    return jsonify({
        "status": "processed",
        "tokens": len(str(payload)),
        "data": payload
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)`,
    "requirements.txt": `flask==3.0.3\ngunicorn==22.0.0\nrequests==2.32.3`,
    "index.html": `<!DOCTYPE html>
<html>
<head><title>Python Microservice</title></head>
<body style="background:#080c14;color:#fff;font-family:sans-serif;padding:2rem;">
  <h2>🐍 Python Flask API Sandbox</h2>
  <p>Live REST service running in Fusion Container</p>
</body>
</html>`
  },
  "vanilla-web": {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Creative Interactive Showcase</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="overlay">
    <h1>✨ Interactive Particle Cloud</h1>
    <p>Real-time canvas rendering inside Fusion AI Studio</p>
  </div>
  <canvas id="canvas"></canvas>
  <script src="main.js"></script>
</body>
</html>`,
    "style.css": `body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #080c14;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.overlay {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
  color: white;
  pointer-events: none;
}
h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #60a5fa;
}
p {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: #94a3b8;
}
canvas {
  display: block;
  width: 100vw;
  height: 100vh;
}`,
    "main.js": `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = Array.from({ length: 60 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 1.5,
  vy: (Math.random() - 0.5) * 1.5,
  radius: Math.random() * 2 + 1
}));

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#60a5fa';
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(render);
}
render();`
  }
};

export const createProject = async ({
  name,
  userId,
  template = "node-express",
  description = "Full-stack AI workspace environment"
}) => {
  if (!name) {
    throw new Error("Project name is required");
  }

  if (!userId) {
    throw new Error("User not found");
  }

  const initialFiles = PROJECT_TEMPLATES[template] || PROJECT_TEMPLATES["node-express"];

  let project;
  try {
    project = await projectModel.create({
      name,
      template,
      description,
      files: initialFiles,
      users: [userId],
      messages: [
        {
          sender: "ai",
          senderName: "Fusion AI",
          text: `Welcome to **${name}**! I'm your AI Copilot. Ask me to generate code, refactor functions, write test suites, or explain architecture.`
        }
      ]
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Project name already exists");
    }
    throw error;
  }

  return project;
};

export const getAllUserProjects = async ({ userId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const userProjects = await projectModel
    .find({ users: userId })
    .populate("users", "email")
    .sort({ updatedAt: -1 });

  return userProjects;
};

export const addUserToProjectService = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }

  if (!users) {
    throw new Error("Users are required");
  }

  if (!Array.isArray(users) || users.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new Error("Invalid user ID");
  }

  if (!userId) {
    throw new Error("User not found");
  }

  const project = await projectModel.findOne({
    _id: projectId,
    users: userId
  });

  if (!project) {
    throw new Error("User does not belong to this project");
  }

  const updatedProject = await projectModel
    .findOneAndUpdate(
      { _id: projectId },
      { $addToSet: { users: { $each: users } } },
      { new: true }
    )
    .populate("users", "email");

  return updatedProject;
};

export const getProjectByIdService = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }

  const project = await projectModel.findOne({ _id: projectId }).populate("users", "email");
  return project;
};

export const getProjectFilesService = async ({ projectId, userId }) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid Project ID is required");
  }

  const project = await projectModel.findOne({ _id: projectId, users: userId });
  if (!project) {
    throw new Error("Project not found or access denied");
  }

  // If no files saved yet, seed with template files
  if (!project.files || Object.keys(project.files).length === 0) {
    const templateKey = project.template || "node-express";
    const initialFiles = PROJECT_TEMPLATES[templateKey] || PROJECT_TEMPLATES["node-express"];
    project.files = initialFiles;
    await project.save();
  }

  return {
    projectId: project._id,
    name: project.name,
    template: project.template,
    files: project.files,
    updatedAt: project.updatedAt
  };
};

export const saveProjectFilesService = async ({ projectId, userId, files }) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid Project ID is required");
  }

  if (!files || typeof files !== "object") {
    throw new Error("Files payload must be an object");
  }

  const project = await projectModel.findOne({ _id: projectId, users: userId });
  if (!project) {
    throw new Error("Project not found or access denied");
  }

  project.files = files;
  project.markModified("files");
  await project.save();

  return {
    success: true,
    message: "Project files saved successfully",
    updatedAt: project.updatedAt
  };
};

export const deleteProjectService = async ({ projectId, userId }) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid Project ID is required");
  }

  const project = await projectModel.findOne({ _id: projectId, users: userId });
  if (!project) {
    throw new Error("Project not found or access denied");
  }

  await projectModel.deleteOne({ _id: projectId });

  return {
    success: true,
    message: "Project deleted successfully"
  };
};

export const updateProjectService = async ({ projectId, userId, name, description }) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid Project ID is required");
  }

  const project = await projectModel.findOne({ _id: projectId, users: userId });
  if (!project) {
    throw new Error("Project not found or access denied");
  }

  if (name && name.trim()) {
    project.name = name.trim();
  }
  if (description !== undefined) {
    project.description = description;
  }

  await project.save();

  return project;
};

export const getProjectMessagesService = async ({ projectId, userId }) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid Project ID is required");
  }

  const project = await projectModel.findOne({ _id: projectId, users: userId });
  if (!project) {
    throw new Error("Project not found or access denied");
  }

  return project.messages || [];
};

export const addProjectMessageService = async ({ projectId, messageData }) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Valid Project ID is required");
  }

  const updatedProject = await projectModel.findByIdAndUpdate(
    projectId,
    {
      $push: {
        messages: {
          $each: [messageData],
          $slice: -100 // retain up to last 100 messages
        }
      }
    },
    { new: true }
  );

  return updatedProject;
};