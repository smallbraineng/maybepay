import { Database } from 'bun:sqlite'
import { existsSync, readFileSync } from 'node:fs'
import {
  type AddressInfo,
  type InventoryRow,
  type Item,
  getItemId,
} from './types'

const DB_PATH = './app.sqlite'
const SCHEMA_PATH = './schema.sql'

const db = new Database(DB_PATH, { create: true })
const schemaSql = readFileSync(SCHEMA_PATH, 'utf-8')
console.log('applying schema')
db.run(schemaSql)

// call this to seed inventory from json
const seedInventory = () => {
  const row = db
    .query<{ count: number }, { count: number }>(
      'SELECT COUNT(*) as count FROM inventory'
    )
    .get({ count: 0 })
  if ((row?.count || 0) === 0 && existsSync('./inventory.json')) {
    const raw = readFileSync('./inventory.json', 'utf-8')
    const inv = JSON.parse(raw) as Record<string, number>
    const insert = db.prepare('INSERT INTO inventory (id, stock) VALUES (?, ?)')
    const insertMany = db.transaction((entries: Array<[string, number]>) => {
      for (const [id, stock] of entries) insert.run(id, stock)
    })
    insertMany(Object.entries(inv))
  }
}

export const getStock = (): Record<string, number> => {
  const map: Record<string, number> = {}
  for (const row of db
    .query('SELECT id, stock FROM inventory')
    .all() as InventoryRow[])
    map[row.id] = row.stock
  return map
}

export const writeOrder = db.transaction(
  (orderId: number, email: string, address: AddressInfo, items: Item[]) => {
    const existingOrder = db
      .query('SELECT order_id FROM orders WHERE order_id = ?')
      .get(orderId)
    if (existingOrder) {
      throw new Error(`order ${orderId} already exists`)
    }

    const itemCounts = new Map<string, number>()
    for (const item of items) {
      const itemId = getItemId(item)
      itemCounts.set(itemId, (itemCounts.get(itemId) || 0) + 1)
    }

    for (const [itemId, qty] of itemCounts) {
      const current = db
        .query('SELECT stock FROM inventory WHERE id = ?')
        .get(itemId) as { stock?: number } | undefined
      if (
        !current ||
        typeof current.stock !== 'number' ||
        current.stock < qty
      ) {
        throw new Error(`out of stock: ${itemId}`)
      }
    }

    const updateInventory = db.prepare(
      'UPDATE inventory SET stock = stock - ? WHERE id = ?'
    )
    const insertOrder = db.prepare(
      'INSERT INTO orders (order_id, email, address_json, items_json) VALUES (?, ?, ?, ?)'
    )

    for (const [itemId, qty] of itemCounts) {
      updateInventory.run(qty, itemId)
    }
    insertOrder.run(
      orderId,
      email,
      JSON.stringify(address),
      JSON.stringify(items)
    )
  }
)
