import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react'
import { addItem } from '../store/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice'
import { productAPI, wishlistAPI } from '../utils/api-endpoints'
import { RootState } from '../store'
import toast from 'react-hot-toast'

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const { token } = useSelector((state: RootState) => state.auth)
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)
  const isInWishlist = wishlistItems.some(item => item.product_id === Number(id))

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getById(Number(id))
        setProduct(response.data.product)
      } catch (error) {
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      toast.error('Insufficient stock')
      return
    }

    dispatch(addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity,
      subtotal: product.price * quantity,
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

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12">Loading...</div>
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-center text-xl">Product not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/products" className="flex items-center gap-2 text-blue-600 mb-8 hover:underline">
        <ArrowLeft size={20} />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>

          <div className="mb-6">
            <span className="text-4xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
            <span className={`ml-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex gap-4 mb-6">
            {/* Quantity Selector */}
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                −
              </button>
              <span className="px-6 py-2">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className={`px-6 py-2 rounded-lg transition ${isInWishlist ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
            >
              <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Product Info */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Product Details</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Category:</strong> Category {product.category_id}</li>
              <li><strong>Status:</strong> {product.is_active ? 'Available' : 'Unavailable'}</li>
              <li><strong>Added:</strong> {new Date(product.created_at).toLocaleDateString()}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
