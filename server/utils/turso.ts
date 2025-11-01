import { createClient } from '@libsql/client'

// Singleton client instance
let client: ReturnType<typeof createClient> | null = null

export function getTursoClient() {
  if (!client) {
    const config = useRuntimeConfig()
    
    client = createClient({
      url: config.tursoUrl,
      authToken: config.tursoAuthToken,
    })
  }
  
  return client
}

// Helper function to execute a query
export async function executeQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const client = getTursoClient()
  const result = await client.execute({
    sql,
    args: params,
  })
  
  return result.rows as T[]
}

// Helper function to execute a single row query
export async function executeQuerySingle<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await executeQuery<T>(sql, params)
  return rows[0] || null
}
