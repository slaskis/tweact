import { useState, useEffect } from "react"

export function useRequest<Req, Res>(request: (req: Req) => Promise<Res>, variables?: Req) {
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
      }, err => {
        if (cancelled) {
          return
        }
        setLoading(false)
        setError(err)
      })
      return () => {
        cancelled = true
      }
    }, [vars])
  
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
  