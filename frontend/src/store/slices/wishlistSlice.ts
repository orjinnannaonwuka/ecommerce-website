import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface WishlistItem {
  id: number
  product_id: number
  name: string
  price: number
  image_url: string
}

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload
    },
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      if (!state.items.find(item => item.product_id === action.payload.product_id)) {
        state.items.push(action.payload)
      }
    },
    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.product_id !== action.payload)
    },
  },
})

export const { setWishlist, addToWishlist, removeFromWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
