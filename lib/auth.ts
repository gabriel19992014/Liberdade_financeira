import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Transaction } from '@/lib/types/finance'

const DATA_DIR = initializeDataDir()

function initializeDataDir(): string {
  const projectDataDir = path.join(process.cwd(), 'data')

  if (ensureDir(projectDataDir)) {
    return projectDataDir
  }

  const tempDataDir = path.join('/tmp', 'finance-app-data')
  if (ensureDir(tempDataDir)) {
    return tempDataDir
  }

  throw new Error('Nao foi possivel inicializar diretorio de dados')
}

function ensureDir(dir: string): boolean {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch (error) {
    return false
  }
}

export interface User {
  id: string
  email: string
  password: string
  name: string
  securityQuestion: string
  securityAnswerHash: string
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()

  if (!secret) {
    throw new Error('JWT_SECRET não configurado no ambiente')
  }

  return secret
}

export function readData<T = unknown>(filename: string): T[] {
  try {
    const filePath = path.join(DATA_DIR, filename)
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data) as T[]
  } catch (error) {
    console.error('Error reading data:', error)
    return []
  }
}

export function writeData<T = unknown>(filename: string, data: T[]): void {
  try {
    const filePath = path.join(DATA_DIR, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return
  } catch (error) {
    console.error('Error writing data:', error)
    throw new Error('Falha ao persistir dados')
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function normalizeSecurityAnswer(answer: string): string {
  return answer
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function verifySecurityAnswer(user: User, answer: string): boolean {
  if (!user.securityAnswerHash) {
    return false
  }

  return verifyPassword(normalizeSecurityAnswer(answer), user.securityAnswerHash)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  const secret = getJwtSecret()

  try {
    const decoded = jwt.verify(token, secret) as { userId: string }
    return decoded
  } catch (error) {
    return null
  }
}

export function getUserByEmail(email: string): User | null {
  const normalizedEmail = normalizeEmail(email)
  const users = readData<User>('users.json')
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail) || null
}

export function getUserById(id: string): User | null {
  const users = readData<User>('users.json')
  return users.find((user) => user.id === id) || null
}

export function createUser(user: Omit<User, 'id'>): User {
  const users = readData<User>('users.json')
  const newUser = {
    ...user,
    email: normalizeEmail(user.email),
    id: Date.now().toString()
  }
  users.push(newUser)
  writeData('users.json', users)
  return newUser
}

export function updateUserPassword(userId: string, passwordHash: string): boolean {
  const users = readData<User>('users.json')
  const userIndex = users.findIndex((user) => user.id === userId)

  if (userIndex === -1) {
    return false
  }

  users[userIndex] = {
    ...users[userIndex],
    password: passwordHash
  }

  writeData('users.json', users)
  return true
}

export function getTransactionsByUserId(userId: string): Transaction[] {
  return readData<Transaction>(`transactions-${userId}.json`)
}

export function saveTransactionsByUserId(userId: string, transactions: Transaction[]): void {
  writeData<Transaction>(`transactions-${userId}.json`, transactions)
}