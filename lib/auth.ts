import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Transaction } from '@/lib/types/finance'
import { getSupabaseServerClient } from '@/lib/supabase-server'

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

interface DbUser {
  id: string
  email: string
  password_hash: string
  name: string
  security_question: string
  security_answer_hash: string
}

interface DbTransaction {
  id: string
  user_id: string
  type: string
  classification: string | null
  category: string
  amount: number
  description: string | null
  date: string
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

function mapDbUserToUser(user: DbUser): User {
  return {
    id: user.id,
    email: user.email,
    password: user.password_hash,
    name: user.name,
    securityQuestion: user.security_question,
    securityAnswerHash: user.security_answer_hash
  }
}

function mapUserToDbPayload(user: Omit<User, 'id'>) {
  return {
    email: normalizeEmail(user.email),
    password_hash: user.password,
    name: user.name,
    security_question: user.securityQuestion,
    security_answer_hash: user.securityAnswerHash
  }
}

function mapDbTransactionToTransaction(transaction: DbTransaction): Transaction {
  return {
    id: transaction.id,
    type: transaction.type as Transaction['type'],
    classification: transaction.classification || 'outros',
    category: transaction.category,
    amount: transaction.amount,
    description: transaction.description || '',
    date: transaction.date
  }
}

function mapTransactionToDbPayload(userId: string, transaction: Transaction) {
  return {
    id: transaction.id,
    user_id: userId,
    type: transaction.type,
    classification: transaction.classification || null,
    category: transaction.category,
    amount: Number(transaction.amount),
    description: transaction.description || null,
    date: transaction.date
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseServerClient()
  const normalizedEmail = normalizeEmail(email)

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, password_hash, name, security_question, security_answer_hash')
      .eq('email', normalizedEmail)
      .maybeSingle<DbUser>()

    if (error) {
      throw new Error(`Falha ao buscar usuario por email: ${error.message}`)
    }

    return data ? mapDbUserToUser(data) : null
  }

  const users = readData<User>('users.json')
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail) || null
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = getSupabaseServerClient()

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, password_hash, name, security_question, security_answer_hash')
      .eq('id', id)
      .maybeSingle<DbUser>()

    if (error) {
      throw new Error(`Falha ao buscar usuario por id: ${error.message}`)
    }

    return data ? mapDbUserToUser(data) : null
  }

  const users = readData<User>('users.json')
  return users.find((user) => user.id === id) || null
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const supabase = getSupabaseServerClient()

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .insert(mapUserToDbPayload(user))
      .select('id, email, password_hash, name, security_question, security_answer_hash')
      .single<DbUser>()

    if (error) {
      throw new Error(`Falha ao criar usuario: ${error.message}`)
    }

    return mapDbUserToUser(data)
  }

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

export async function updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
  const supabase = getSupabaseServerClient()

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId)
      .select('id')
      .maybeSingle<{ id: string }>()

    if (error) {
      throw new Error(`Falha ao atualizar senha: ${error.message}`)
    }

    return Boolean(data)
  }

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

export async function getTransactionsByUserId(userId: string): Promise<Transaction[]> {
  const supabase = getSupabaseServerClient()

  if (supabase) {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, user_id, type, classification, category, amount, description, date')
      .eq('user_id', userId)
      .returns<DbTransaction[]>()

    if (error) {
      throw new Error(`Falha ao buscar transacoes: ${error.message}`)
    }

    return (data || []).map(mapDbTransactionToTransaction)
  }

  return readData<Transaction>(`transactions-${userId}.json`)
}

export async function saveTransactionsByUserId(userId: string, transactions: Transaction[]): Promise<void> {
  const supabase = getSupabaseServerClient()

  if (supabase) {
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      throw new Error(`Falha ao limpar transacoes: ${deleteError.message}`)
    }

    if (transactions.length > 0) {
      const payload = transactions.map((transaction) => mapTransactionToDbPayload(userId, transaction))

      const { error: insertError } = await supabase
        .from('transactions')
        .insert(payload)

      if (insertError) {
        throw new Error(`Falha ao salvar transacoes: ${insertError.message}`)
      }
    }

    return
  }

  writeData<Transaction>(`transactions-${userId}.json`, transactions)
}