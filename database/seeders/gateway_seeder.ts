import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    await db.table('gateways').multiInsert([
      { name: 'Gateway 1', is_active: true, priority: 1, created_at: new Date(), updated_at: new Date() },
      { name: 'Gateway 2', is_active: true, priority: 2, created_at: new Date(), updated_at: new Date() },
    ])
  }
}
