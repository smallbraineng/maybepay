import colors from 'tailwindcss/colors'

export type Product = {
  id: string
  title: string
  price: number
  image: string
  description: string
  reviews: string[]
  colors: string[]
}

export const products: Product[] = [
  {
    id: '1',
    title: 'Hoodie',
    price: 60,
    image: '/assets/test-hoodie.png',
    description:
      'A timeless white t-shirt made from premium organic cotton. Perfect for any occasion.',
    reviews: [
      'https://twitter.com/user1/status/123456789',
      'https://twitter.com/user2/status/987654321',
    ],
    colors: [colors.stone[900], colors.stone[200]],
  },
  {
    id: '2',
    title: 'Joggers',
    price: 89.99,
    image: '/assets/test-hoodie.png',
    description:
      'A classic denim jacket with a vintage wash. Crafted for durability and style.',
    reviews: [
      'https://twitter.com/user3/status/456789123',
      'https://twitter.com/user4/status/654321987',
    ],
    colors: [colors.stone[900], colors.stone[200]],
  },
  {
    id: '3',
    title: 'Tee',
    price: 59.99,
    image: '/assets/test-hoodie.png',
    description:
      'A comfortable hoodie with clean lines and premium materials. Perfect for everyday wear.',
    reviews: [
      'https://twitter.com/user5/status/789123456',
      'https://twitter.com/user6/status/321987654',
    ],
    colors: [colors.stone[900], colors.stone[200]],
  },
  {
    id: '4',
    title: 'Beanie',
    price: 59.99,
    image: '/assets/test-hoodie.png',
    description:
      'A comfortable hoodie with clean lines and premium materials. Perfect for everyday wear.',
    reviews: [
      'https://twitter.com/user5/status/789123456',
      'https://twitter.com/user6/status/321987654',
    ],
    colors: [colors.stone[900]],
  },
]
