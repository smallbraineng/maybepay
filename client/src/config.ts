export type Product = {
  id: string
  title: string
  price: number
  image: string
  description: string
  reviews: string[]
}

export const products: Product[] = [
  {
    id: '1',
    title: 'Classic White Tee',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    description: 'A timeless white t-shirt made from premium organic cotton. Perfect for any occasion.',
    reviews: [
      'https://twitter.com/user1/status/123456789',
      'https://twitter.com/user2/status/987654321'
    ]
  },
  {
    id: '2',
    title: 'Vintage Denim Jacket',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=400&fit=crop',
    description: 'A classic denim jacket with a vintage wash. Crafted for durability and style.',
    reviews: [
      'https://twitter.com/user3/status/456789123',
      'https://twitter.com/user4/status/654321987'
    ]
  },
  {
    id: '3',
    title: 'Minimalist Hoodie',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    description: 'A comfortable hoodie with clean lines and premium materials. Perfect for everyday wear.',
    reviews: [
      'https://twitter.com/user5/status/789123456',
      'https://twitter.com/user6/status/321987654'
    ]
  }
]