import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { excelRowSchema } from '@/lib/validations'
import { canImportExcel, getRolesUserCanAssign } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import * as XLSX from 'xlsx'
import { eq } from 'drizzle-orm'

interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; employeeId: string; error: string }>
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userRole = session.user.role as Role

    if (!canImportExcel(userRole)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 })
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Неверный формат файла. Поддерживаются только .xlsx и .xls' },
        { status: 400 }
      )
    }

    // Read file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)

    if (data.length === 0) {
      return NextResponse.json({ error: 'Файл пустой' }, { status: 400 })
    }

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    const allowedRoles = getRolesUserCanAssign(userRole)

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      const rowNumber = i + 2 // +2 because Excel starts at 1 and has header

      try {
        // Validate row data
        const validatedData = excelRowSchema.safeParse({
          employeeId: String(row.employeeId || '').trim(),
          firstName: String(row.firstName || '').trim(),
          lastName: String(row.lastName || '').trim(),
          email: row.email ? String(row.email).trim() : '',
          password: String(row.password || '').trim(),
          role: String(row.role || '').trim()
        })

        if (!validatedData.success) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            employeeId: String(row.employeeId || 'N/A'),
            error: validatedData.error.errors.map(e => e.message).join(', ')
          })
          continue
        }

        const { employeeId, password, firstName, lastName, email, role } = validatedData.data

        // Check if user can assign this role
        if (!allowedRoles.includes(role)) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            employeeId,
            error: `Вы не можете назначать роль: ${role}`
          })
          continue
        }

        // Check if employee ID already exists
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.employeeId, employeeId))
          .limit(1)

        if (existingUser) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            employeeId,
            error: 'Пользователь уже существует'
          })
          continue
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        await db.insert(users).values({
          employeeId,
          password: hashedPassword,
          firstName,
          lastName,
          email: email || null,
          role,
          createdBy: session.user.id,
          isActive: true
        })

        result.success++
      } catch (error) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          employeeId: String(row.employeeId || 'N/A'),
          error: 'Ошибка создания пользователя'
        })
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error importing users:', error)
    return NextResponse.json({ error: 'Ошибка импорта пользователей' }, { status: 500 })
  }
}
