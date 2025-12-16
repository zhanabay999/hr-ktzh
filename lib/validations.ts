import { z } from 'zod'

// Role enum
export const roleSchema = z.enum([
  'super_admin',
  'hr_super',
  'hr_central',
  'hr_regional',
  'hr_line',
  'employee'
])

// Login validation
export const loginSchema = z.object({
  employeeId: z
    .string()
    .length(7, 'Табельный номер должен содержать 7 цифр')
    .regex(/^\d{7}$/, 'Табельный номер должен содержать только цифры'),
  password: z.string().min(1, 'Введите пароль')
})

export type LoginInput = z.infer<typeof loginSchema>

// Create user validation
export const createUserSchema = z.object({
  employeeId: z
    .string()
    .length(7, 'Табельный номер должен содержать 7 цифр')
    .regex(/^\d{7}$/, 'Табельный номер должен содержать только цифры'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
  firstName: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя не должно превышать 100 символов'),
  lastName: z
    .string()
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .max(100, 'Фамилия не должна превышать 100 символов'),
  email: z
    .string()
    .email('Неверный формат email')
    .optional()
    .or(z.literal('')),
  role: roleSchema
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// Update user validation
export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя не должно превышать 100 символов')
    .optional(),
  lastName: z
    .string()
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .max(100, 'Фамилия не должна превышать 100 символов')
    .optional(),
  email: z
    .string()
    .email('Неверный формат email')
    .optional()
    .or(z.literal('')),
  role: roleSchema.optional(),
  isActive: z.boolean().optional()
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

// Create course validation
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(255, 'Название не должно превышать 255 символов'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .optional(),
  content: z.string().optional()
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>

// Excel import validation
export const excelRowSchema = z.object({
  employeeId: z
    .string()
    .length(7, 'Табельный номер должен содержать 7 цифр')
    .regex(/^\d{7}$/, 'Табельный номер должен содержать только цифры'),
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  email: z
    .string()
    .email('Неверный формат email')
    .optional()
    .or(z.literal('')),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  role: roleSchema
})

export type ExcelRowInput = z.infer<typeof excelRowSchema>
