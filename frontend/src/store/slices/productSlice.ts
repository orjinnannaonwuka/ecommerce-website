import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category_id: number
  image_url: string
  is_active: boolean
  created_at: string
}

interface ProductState {
  products: Product[]
  selectedProduct: Product | null
  isLoading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
    },
    setSelectedProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
})

export const { setProducts, setSelectedProduct, setLoading, setError } = productSlice.actions
export default productSlice.reducer
