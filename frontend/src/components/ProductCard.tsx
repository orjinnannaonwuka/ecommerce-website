import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addItem } from '../store/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice'
import { RootState } from '../store'
import toast from 'react-hot-toast'
import { cartAPI, wishlistAPI } from '../utils/api-endpoints'

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    image_url: string
    description: string
  }
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch()
  const { token } = useSelector((state: RootState) => state.auth)
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)
  const isInWishlist = wishlistItems.some(item => item.product_id === product.id)

  const handleAddToCart = () => {
    dispatch(addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
      subtotal: product.price,
    }))
    toast.success('Added to cart!')
  }

  const handleWishlist = async () => {
    if (!token) {
      toast.error('Please login first')
      return
    }

    try {
      if (isInWishlist) {
        await wishlistAPI.remove(product.id)
        dispatch(removeFromWishlist(product.id))
        toast.success('Removed from wishlist')
      } else {
        await wishlistAPI.add({ product_id: product.id })
        dispatch(addToWishlist({
          id: product.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        }))
        toast.success('Added to wishlist!')
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold hover:text-blue-600 transition">{product.name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
          <div className="flex gap-2">
            <button
              onClick={handleWishlist}
              className={`p-2 rounded ${isInWishlist ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            >
              <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
