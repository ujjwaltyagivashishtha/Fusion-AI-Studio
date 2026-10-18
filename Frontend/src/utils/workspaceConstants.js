export const INITIAL_FILES = {
  'app.js': `// Fusion AI Studio - Express Application Server
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to Fusion AI Cloud Workspace!",
    status: "Operational",
    version: "2.5.0",
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, memory: "142MB", latency: "1.2ms" });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running smoothly on port \${PORT}\`);
});`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fusion AI Web Preview</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h1>🚀 Fusion Live Web Container</h1>
      <span class="badge">● Online</span>
    </div>
    <p style="color: #94A3B8; line-height: 1.6;">
      Your full-stack application preview is executing and live-rendering inside our isolated cloud environment.
    </p>
    <button class="btn" onclick="alert('Container interaction verified! All cloud systems normal.')">Test Cloud Interaction</button>
  </div>
</body>
</html>`,
  'style.css': `/* Workspace Global Stylesheet */
:root {
  --primary: #3b82f6;
  --bg-dark: #080c14;
}

body { 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
  background: #080C14; 
  color: #F8FAFC; 
  padding: 2.5rem; 
  margin: 0;
}
.card { 
  background: rgba(30, 41, 59, 0.45); 
  padding: 2rem; 
  border-radius: 1.25rem; 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6);
  max-width: 600px;
  margin: 0 auto;
}
h1 { 
  color: #60A5FA; 
  margin-top: 0; 
  font-size: 1.5rem;
}
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.15);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #2563EB, #4F46E5);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
  transition: transform 0.15s ease;
}
.btn:hover {
  transform: translateY(-2px);
}`,
  'package.json': `{
  "name": "fusion-ai-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`
}

export const getFileBadge = (name) => {
  if (name.endsWith('.js') || name.endsWith('.mjs')) return { icon: 'ri-javascript-line', color: 'text-amber-500' }
  if (name.endsWith('.jsx')) return { icon: 'ri-reactjs-line', color: 'text-cyan-500' }
  if (name.endsWith('.html')) return { icon: 'ri-html5-line', color: 'text-orange-500' }
  if (name.endsWith('.css')) return { icon: 'ri-css3-line', color: 'text-blue-500' }
  if (name.endsWith('.json')) return { icon: 'ri-braces-line', color: 'text-emerald-500' }
  if (name.endsWith('.py')) return { icon: 'ri-code-s-slash-line', color: 'text-yellow-500' }
  return { icon: 'ri-file-text-line', color: 'text-muted' }
}

export const generatePreviewDoc = (files) => {
  const html = files['index.html'] || '<html><head></head><body><div id="root"><h1>No HTML Entry</h1></div></body></html>'
  const css = files['style.css'] || files['src/style.css'] || files['src/index.css'] || ''
  const js = files['main.js'] || ''

  let doc = html
  if (css && !doc.includes(css)) {
    if (doc.includes('</head>')) {
      doc = doc.replace('</head>', `<style>${css}</style></head>`)
    } else {
      doc = `<style>${css}</style>` + doc
    }
  }

  const captureScript = `<script>
    (function() {
      const origLog = console.log;
      const origErr = console.error;
      window.addEventListener('error', function(e) {
        window.parent.postMessage({ type: 'PREVIEW_CONSOLE', level: 'error', message: e.message }, '*');
      });
      console.log = function(...args) {
        origLog.apply(console, args);
        window.parent.postMessage({ type: 'PREVIEW_CONSOLE', level: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
      };
      console.error = function(...args) {
        origErr.apply(console, args);
        window.parent.postMessage({ type: 'PREVIEW_CONSOLE', level: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
      };
    })();
  </script>`

  if (doc.includes('<head>')) {
    doc = doc.replace('<head>', `<head>${captureScript}`)
  } else {
    doc = captureScript + doc
  }

  if (js) {
    doc += `<script>${js}</script>`
  }

  return doc
}
