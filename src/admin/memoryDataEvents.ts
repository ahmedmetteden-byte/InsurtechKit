/**
 * Lightweight pub/sub for in-memory module mutations.
 * Dashboard (and other listeners) re-read services when data changes.
 */
type Listener = () => void

const listeners = new Set<Listener>()

export function onMemoryDataChange(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function emitMemoryDataChange(): void {
  listeners.forEach(listener => listener())
}
