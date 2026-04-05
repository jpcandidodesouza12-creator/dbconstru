// backend/src/index.ts
import 'dotenv/config'
import 'express-async-errors'
import app from './app'

const PORT = Number(process.env.PORT) || 4000

// Adicionamos '0.0.0.0' para permitir conexões externas ao container
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐕 Dumb Construtor API running on port ${PORT}`)
  console.log(`    ENV: ${process.env.NODE_ENV}`)
})