import { createServer } from 'node:http'

const PORT = process.env.PORT ?? 3000

const users = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
]

let nextId = users.length + 1

function json(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const method = req.method
  const path = url.pathname

  // GET /api/health
  if (method === 'GET' && path === '/api/health') {
    return json(res, 200, { status: 'ok' })
  }

  // GET /api/users/:id
  const userMatch = path.match(/^\/api\/users\/(\d+)$/)
  if (method === 'GET' && userMatch) {
    const id = Number(userMatch[1])
    const user = users.find((u) => u.id === id)
    if (!user) return json(res, 404, { error: 'User not found' })
    return json(res, 200, user)
  }

  // POST /api/users
  if (method === 'POST' && path === '/api/users') {
    const body = await readBody(req)
    let payload
    try {
      payload = JSON.parse(body)
    } catch {
      return json(res, 400, { error: 'Invalid JSON' })
    }
    if (!payload.name) return json(res, 400, { error: '"name" is required' })
    const newUser = { id: nextId++, name: payload.name, email: payload.email ?? null }
    users.push(newUser)
    return json(res, 201, newUser)
  }

  json(res, 404, { error: 'Not found' })
})

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
  })
}

server.listen(PORT, () => {
  console.log(`Example API running at http://localhost:${PORT}`)
  console.log('Endpoints:')
  console.log('  GET  /api/health')
  console.log('  GET  /api/users/:id')
  console.log('  POST /api/users')
})
