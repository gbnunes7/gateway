import { BaseSeeder } from '@adonisjs/lucid/seeders'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    const existing = await db.from('users').where('email', 'admin@betalent.tech').first()
    if (existing) return
    const hashedPassword = await hash.make('secret')
    await db.table('users').insert({
      full_name: 'Admin',
      email: 'admin@betalent.tech',
      password: hashedPassword,
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date(),
    })
  }
}
