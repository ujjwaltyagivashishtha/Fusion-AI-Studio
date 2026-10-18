export const TEMPLATE_OPTIONS = [
  {
    id: 'node-express',
    name: 'Node.js Express API',
    icon: 'ri-nodejs-line',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    desc: 'Express microservice with live container preview'
  },
  {
    id: 'react-vite',
    name: 'React + Vite Application',
    icon: 'ri-reactjs-line',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    desc: 'Modern React web application with lightning HMR'
  },
  {
    id: 'python-flask',
    name: 'Python Flask API',
    icon: 'ri-code-s-slash-line',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    desc: 'Lightweight Python microservice with REST endpoints'
  },
  {
    id: 'vanilla-web',
    name: 'Vanilla Canvas & Web',
    icon: 'ri-html5-line',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    desc: 'HTML5, modern CSS3, and JavaScript live canvas'
  }
]

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently'
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now - past
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
