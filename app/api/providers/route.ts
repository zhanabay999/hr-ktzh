import { auth } from '@/lib/auth'
import { db } from '@/db'
import { providers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { canCreateCourses } from '@/lib/permissions'
import { Role } from '@/db/schema'

// GET - получить всех провайдеров
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const allProviders = await db
      .select()
      .from(providers)
      .orderBy(providers.name)

    return NextResponse.json(allProviders)
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки провайдеров' },
      { status: 500 }
    )
  }
}

// POST - создать нового провайдера
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userRole = session.user.role as Role

    if (!canCreateCourses(userRole)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, website, contactEmail, contactPhone } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Название провайдера обязательно' },
        { status: 400 }
      )
    }

    const [newProvider] = await db
      .insert(providers)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        website: website?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        createdBy: session.user.id,
        isActive: true
      })
      .returning()

    return NextResponse.json(newProvider, { status: 201 })
  } catch (error: any) {
    console.error('Error creating provider:', error)

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Провайдер с таким названием уже существует' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка создания провайдера' },
      { status: 500 }
    )
  }
}

// PATCH - обновить провайдера
export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userRole = session.user.role as Role

    if (!canCreateCourses(userRole)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, description, website, contactEmail, contactPhone, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'ID провайдера обязателен' }, { status: 400 })
    }

    const updateData: any = { updatedAt: new Date() }

    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (website !== undefined) updateData.website = website?.trim() || null
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail?.trim() || null
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone?.trim() || null
    if (isActive !== undefined) updateData.isActive = isActive

    const [updatedProvider] = await db
      .update(providers)
      .set(updateData)
      .where(eq(providers.id, id))
      .returning()

    if (!updatedProvider) {
      return NextResponse.json({ error: 'Провайдер не найден' }, { status: 404 })
    }

    return NextResponse.json(updatedProvider)
  } catch (error: any) {
    console.error('Error updating provider:', error)

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Провайдер с таким названием уже существует' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка обновления провайдера' },
      { status: 500 }
    )
  }
}
