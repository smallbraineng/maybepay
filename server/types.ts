import { SHA256 } from 'bun'
import { z } from 'zod'

export enum Color {
  STONE = 'stone',
  ICE = 'ice',
}

export enum Size {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum ItemCategory {
  HOODIE = 'hoodie',
  SHIRT = 'shirt',
  JOGGERS = 'joggers',
  BEANIE = 'beanie',
}

export type Item = {
  category: ItemCategory
  color: Color
  size: Size
}

export const getItemId = (item: Item): string => {
  return `${item.category}-${item.color}-${item.size}`
}

export type AddressInfo = {
  fullName: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export const ItemSchema = z.object({
  category: z.nativeEnum(ItemCategory),
  color: z.nativeEnum(Color),
  size: z.nativeEnum(Size),
})

export const AddressInfoSchema = z.object({
  fullName: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(2),
  country: z.string().min(2),
})

export const OrderInputSchema = z.object({
  orderId: z.number().int().nonnegative(),
  email: z.string().email(),
  address: AddressInfoSchema,
  items: z.array(ItemSchema).min(1),
})

export type OrderInput = z.infer<typeof OrderInputSchema>

const stableStringify = (value: unknown): string => {
  const type = typeof value
  if (
    value === null ||
    type === 'number' ||
    type === 'boolean' ||
    type === 'string'
  ) {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(',')}]`
  }
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(',')}}`
}

export const hashOrder = (input: OrderInput): string => {
  const itemsSorted = [...input.items].sort((a, b) => {
    const ak = `${a.category}-${a.color}-${a.size}`
    const bk = `${b.category}-${b.color}-${b.size}`
    return ak.localeCompare(bk)
  })
  const normalized = { ...input, items: itemsSorted }
  const json = stableStringify(normalized)
  return SHA256.hash(json, 'hex').toString().toLowerCase()
}

export type InventoryRow = {
  id: string
  stock: number
}
