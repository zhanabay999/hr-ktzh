import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { db } from './index'
import { users } from './schema'
import * as bcrypt from 'bcryptjs'

async function seed() {
  console.log('Starting database seed...')

  try {
    // Hash passwords
    const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 12)
    const hrSuperPassword = await bcrypt.hash('HRSuper123!', 12)

    // Create Super Admin
    const [superAdmin] = await db
      .insert(users)
      .values({
        employeeId: '0000001',
        password: superAdminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@hr-ktzh.kz',
        role: 'super_admin',
        isActive: true
      })
      .returning()

    console.log('✓ Super Admin created:', superAdmin.employeeId)

    // Create 5 HR Super Admins
    const hrSuperAdmins = []
    for (let i = 2; i <= 6; i++) {
      const employeeId = String(i).padStart(7, '0')
      const [hrSuper] = await db
        .insert(users)
        .values({
          employeeId,
          password: hrSuperPassword,
          firstName: `HR Super`,
          lastName: `Admin ${i - 1}`,
          email: `hrsuper${i - 1}@hr-ktzh.kz`,
          role: 'hr_super',
          createdBy: superAdmin.id,
          isActive: true
        })
        .returning()

      hrSuperAdmins.push(hrSuper)
      console.log(`✓ HR Super Admin ${i - 1} created:`, hrSuper.employeeId)
    }

    console.log('\n✅ Database seeded successfully!')
    console.log('\nLogin credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Super Admin:')
    console.log('  Employee ID: 0000001')
    console.log('  Password: SuperAdmin123!')
    console.log('\nHR Super Admins (5 users):')
    console.log('  Employee IDs: 0000002 - 0000006')
    console.log('  Password: HRSuper123!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()
