import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  id: number
  product_id: number
  name: string
  price: number
  image_url: string
  quantity: number
  subtotal: number
}

interface CartState {
  items: CartItem[]
  total: number
  isLoading: boolean
}

const initialState: CartState = {
  items: [],
  total: 0,
  isLoading: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<{ items: CartItem[], total: number }>) => {
      state.items = action.payload.items
      state.total = action.payload.total
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(item => item.product_id === action.payload.product_id)
      if (existing) {
        existing.quantity += action.payload.quantity
        existing.subtotal = existing.price * existing.quantity
      } else {
        state.items.push(action.payload)
      }
      state.total = state.items.reduce((sum, item) => sum + item.subtotal, 0)
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      state.total = state.items.reduce((sum, item) => sum + item.subtotal, 0)
    },
    updateQuantity: (state, action: PayloadAction<{ id: number, quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (item) {
        item.quantity = action.payload.quantity
        item.subtotal = item.price * item.quantity
      }
      state.total = state.items.reduce((sum, item) => sum + item.subtotal, 0)
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
    },
  },
})

export const { setCartItems, addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
