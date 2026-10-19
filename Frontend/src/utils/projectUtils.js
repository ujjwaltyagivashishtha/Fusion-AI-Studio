export const TEMPLATE_OPTIONS = [
  {
    id: 'node-express',
    name: 'Node.js Express',
    tag: 'Node.js',
    icon: 'ri-nodejs-line',
    file: 'app.js',
    fileIcon: 'ri-javascript-line text-amber-400',
    desc: 'Express application server with REST API routes'
  },
  {
    id: 'react-vite',
    name: 'React + Vite',
    tag: 'React',
    icon: 'ri-reactjs-line',
    file: 'App.jsx',
    fileIcon: 'ri-reactjs-line text-cyan-400',
    desc: 'Modern React 19 application with fast Vite HMR'
  },
  {
    id: 'python-flask',
    name: 'Python Flask',
    tag: 'Python',
    icon: 'ri-code-s-slash-line',
    file: 'app.py',
    fileIcon: 'ri-code-s-slash-line text-blue-400',
    desc: 'Python microservice with Flask REST endpoints'
  },
  {
    id: 'vanilla-web',
    name: 'Vanilla Web',
    tag: 'Vanilla',
    icon: 'ri-html5-line',
    file: 'index.html',
    fileIcon: 'ri-html5-line text-orange-400',
    desc: 'HTML5, modern CSS3, and JavaScript live canvas'
  }
]

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently'
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now - past
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
