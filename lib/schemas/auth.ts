import { z } from 'zod'

export const emailSchema = z
  .string()
  .trim()
  .email('Email inválido')
  .transform((value) => value.toLowerCase())

export const loginPayloadSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória')
})

export const registerPayloadSchema = z.object({
  name: z.string().trim().min(2, 'Nome é obrigatório').max(120, 'Nome muito longo'),
  email: emailSchema,
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').max(128, 'Senha muito longa'),
  securityQuestion: z.string().trim().min(8, 'Informe uma pergunta de segurança válida').max(180, 'Pergunta muito longa'),
  securityAnswer: z.string().trim().min(2, 'Informe a resposta da pergunta de segurança').max(180, 'Resposta muito longa')
})

export const forgotPasswordQuestionPayloadSchema = z.object({
  email: emailSchema
})

export const forgotPasswordResetPayloadSchema = z.object({
  email: emailSchema,
  securityAnswer: z.string().trim().min(2, 'Informe a resposta da pergunta de segurança').max(180, 'Resposta muito longa'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').max(128, 'Senha muito longa')
})

export const resetPasswordPayloadSchema = z.object({
  token: z.string().trim().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').max(128, 'Senha muito longa')
})
