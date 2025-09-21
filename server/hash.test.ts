import { describe, expect, test } from 'bun:test'
import {
  type AddressInfo,
  Color,
  ItemCategory,
  type OrderInput,
  Size,
  hashOrder,
} from './types'

describe('hashOrder', () => {
  test('produces the same hash regardless of items order', () => {
    const base: OrderInput = {
      orderId: 123,
      email: 'user@example.com',
      address: {
        fullName: 'Ada Lovelace',
        address1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
      items: [
        { category: ItemCategory.HOODIE, color: Color.STONE, size: Size.M },
        { category: ItemCategory.BEANIE, color: Color.STONE, size: Size.S },
      ],
    }

    const alt: OrderInput = {
      ...base,
      items: [
        { category: ItemCategory.BEANIE, color: Color.STONE, size: Size.S },
        { category: ItemCategory.HOODIE, color: Color.STONE, size: Size.M },
      ],
    }

    const h1 = hashOrder(base)
    const h2 = hashOrder(alt)
    expect(h1).toBe(h2)
  })

  test('permutations of three items yield identical hashes', () => {
    const items = [
      { category: ItemCategory.HOODIE, color: Color.STONE, size: Size.M },
      { category: ItemCategory.BEANIE, color: Color.STONE, size: Size.S },
      { category: ItemCategory.SHIRT, color: Color.ICE, size: Size.L },
    ]

    const base: OrderInput = {
      orderId: 999,
      email: 'same@example.com',
      address: {
        fullName: 'Ada Lovelace',
        address1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
      items,
    }

    const perms = (arr: typeof items): (typeof items)[] => {
      if (arr.length <= 1) return [arr]
      const result: (typeof items)[] = []
      for (let i = 0; i < arr.length; i++) {
        const head = arr[i]
        if (!head) continue
        const rest = arr.slice(0, i).concat(arr.slice(i + 1))
        for (const p of perms(rest)) result.push([head, ...p])
      }
      return result
    }

    const reference = hashOrder(base)
    for (const p of perms(items)) {
      const h = hashOrder({ ...base, items: p })
      expect(h).toBe(reference)
    }
  })

  test('address key order does not affect hash', () => {
    const addrA = JSON.parse(
      '{"fullName":"Ada","address1":"123","city":"SF","state":"CA","postalCode":"94105","country":"US"}'
    ) as AddressInfo
    const addrB = JSON.parse(
      '{"country":"US","postalCode":"94105","state":"CA","city":"SF","address1":"123","fullName":"Ada"}'
    ) as AddressInfo

    const inputA: OrderInput = {
      orderId: 1,
      email: 'user@example.com',
      address: addrA,
      items: [
        { category: ItemCategory.HOODIE, color: Color.STONE, size: Size.M },
        { category: ItemCategory.BEANIE, color: Color.STONE, size: Size.S },
      ],
    }
    const inputB: OrderInput = { ...inputA, address: addrB }

    expect(hashOrder(inputA)).toBe(hashOrder(inputB))
  })

  test('small meaningful changes produce different hashes', () => {
    const base: OrderInput = {
      orderId: 321,
      email: 'user@example.com',
      address: {
        fullName: 'Ada Lovelace',
        address1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
      items: [
        { category: ItemCategory.HOODIE, color: Color.STONE, size: Size.M },
      ],
    }

    const hBase = hashOrder(base)
    const hEmail = hashOrder({ ...base, email: 'other@example.com' })
    const hItem = hashOrder({
      ...base,
      items: [
        { category: ItemCategory.HOODIE, color: Color.STONE, size: Size.L },
      ],
    })
    expect(hBase).not.toBe(hEmail)
    expect(hBase).not.toBe(hItem)
  })

  test('hash is 64-char lowercase hex', () => {
    const input: OrderInput = {
      orderId: 42,
      email: 'abc@example.com',
      address: {
        fullName: 'A B',
        address1: 'Road',
        city: 'Town',
        state: 'TS',
        postalCode: '00000',
        country: 'US',
      },
      items: [
        { category: ItemCategory.BEANIE, color: Color.STONE, size: Size.S },
      ],
    }
    const h = hashOrder(input)
    expect(h).toMatch(/^[0-9a-f]{64}$/)
    expect(h).toBe(h.toLowerCase())
  })
})
