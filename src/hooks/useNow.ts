import { useEffect, useState } from 'react'

// The current time, refreshed every minute so displayed local times stay current
export function useNow(intervalMs = 60 * 1000) {
    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), intervalMs)
        return () => clearInterval(timer)
    }, [intervalMs])
    return now
}
