import { useState, useRef, useCallback, useEffect } from 'react';

export type EventSourceStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

export interface SSEEvent {
  type: string;
  data: string;
  timestamp: number;
}

export interface UseEventSourceResult {
  events: SSEEvent[];
  status: EventSourceStatus;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * useEventSource — wraps the native EventSource API with React state.
 *
 * Connects to a SSE endpoint and accumulates events.
 * Connection is closed and cleaned up on unmount or explicit stop().
 *
 * @param url - SSE endpoint URL
 * @param eventTypes - event types to listen for (default: ['message'])
 */
export function useEventSource(
  url: string,
  eventTypes: string[] = ['message']
): UseEventSourceResult {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [status, setStatus] = useState<EventSourceStatus>('idle');
  const sourceRef = useRef<EventSource | null>(null);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    setStatus('closed');
  }, []);

  const reset = useCallback(() => {
    stop();
    setEvents([]);
    setStatus('idle');
  }, [stop]);

  const start = useCallback(() => {
    if (sourceRef.current) return; // already connected

    setStatus('connecting');
    setEvents([]);

    const source = new EventSource(url);
    sourceRef.current = source;

    source.onopen = () => setStatus('open');
    source.onerror = () => {
      setStatus('error');
      source.close();
      sourceRef.current = null;
    };

    // Listen to each requested event type
    for (const type of eventTypes) {
      source.addEventListener(type, (e: MessageEvent) => {
        setEvents(prev => [{
          type,
          data: e.data,
          timestamp: Date.now(),
        }, ...prev]);

        // Auto-close on 'done' event
        if (type === 'done') {
          source.close();
          sourceRef.current = null;
          setStatus('closed');
        }
      });
    }
  }, [url, eventTypes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sourceRef.current?.close();
    };
  }, []);

  return { events, status, start, stop, reset };
}
