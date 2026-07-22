import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import api from '@/lib/api'

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function track() {
      try {
        const { data } = await api.post('/stats/visit')
        if (!cancelled) setCount(data.count)
      } catch {
        // silently ignore — counter is non-critical
      }
    }

    track()
    return () => { cancelled = true }
  }, [])

  if (count === null) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs text-neutral-400 flex items-center gap-1.5">
      <Eye className="h-3 w-3" />
      <span>{count.toLocaleString()} visits</span>
    </div>
  )
}
