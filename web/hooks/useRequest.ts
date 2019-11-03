import { useState, useEffect } from "react";

type Request<Req, Res> = (req: Req) => Promise<Res>

const handlers: Set<{handler: () => void, matcher: any}> = new Set()
const pending: Set<{handler: () => void, matcher: any}> = new Set()

export function invalidate<Req, Res>(request: Request<Req, Res>) {
    for (let handler of handlers) {
        if (handler.matcher === request) {
            pending.add(handler)
        }
    }
}

function revalidate() {
    for (let handler of pending) {
        handler.handler()
    }
    pending.clear()
}

function useInvalidate(matcher: any) {
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        const handler = {
            handler() { 
                setAttempt(attempt + 1)
            }, 
            matcher
        }
        handlers.add(handler)
        return () => {
            handlers.delete(handler)
        }
    }, [attempt])
    
    return attempt
}

export function useRequest<Req, Res>(request: Request<Req, Res>, variables?: Req) {
    const attempt = useInvalidate(request)
    const [vars, setVariables] = useState(variables)
    const [data, setData] = useState<Partial<Res>>({})
    const [loading, setLoading] = useState<boolean>(vars !== undefined)
    const [error, setError] = useState<Error | undefined>(undefined)
    
    useEffect(() => {
      if (!vars) {
        return
      }
      let cancelled = false
      request(vars).then(res => {
        if (cancelled) {
          return
        }
        setLoading(false)
        setData(res)
        revalidate()
      }, err => {
        if (cancelled) {
          return
        }
        setLoading(false)
        setError(err)
        revalidate()
      })
      return () => {
        cancelled = true
      }
    }, [vars, attempt])
  
    function update(req: Req) {
      setLoading(true)
      setError(undefined)
      setVariables(req)
    }
  
    return {
      data,
      loading,
      error,
      update
    }
  }
  