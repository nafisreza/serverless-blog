import { Hono } from 'hono'
import { createPrismaClient } from './db'

type Bindings = {
  DATABASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Testing the database connection
app.get('/test-db', async (c) => {
  const prisma = createPrismaClient(c.env.DATABASE_URL)
  
  try {
    await prisma.$queryRaw`SELECT 1`
    return c.json({ message: 'Database connection successful!' })
  } catch (error) {
    console.error('Database connection failed:', error)
    return c.json({ error: 'Database connection failed' }, 500)
  }
})

export default app
