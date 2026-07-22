let es: EventSource | null = null
const listeners = new Map<string, Set<(data: any) => void>>()

function ensureConnected() {
  if (es) return
  es = new EventSource('/api/sse/subscribe', { withCredentials: true })
  es.onerror = () => {}
  for (const [event, handlers] of listeners) {
    es.addEventListener(event, (e: MessageEvent) => {
      handlers.forEach(h => h(JSON.parse(e.data)))
    })
  }
}

export function onSSE(event: string, handler: (data: any) => void) {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(handler)
  if (es) {
    es.addEventListener(event, (e: MessageEvent) => handler(JSON.parse(e.data)))
  } else {
    ensureConnected()
  }
  return () => {
    listeners.get(event)?.delete(handler)
  }
}

export function disconnectSSE() {
  es?.close()
  es = null
}
