import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { RootState } from '../store'
import { setWishlist, removeFromWishlist } from '../store/slices/wishlistSlice'
import { wishlistAPI, cartAPI } from '../utils/api-endpoints'
import { addItem } from '../store/slices/cartSlice'
import toast from 'react-hot-toast'

const WishlistPage: React.FC = () => {
  const dispatch = useDispatch()
  const { items } = useSelector((state: RootState) => state.wishlist)
  const { token } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) return
      try {
        const response = await wishlistAPI.get()
        dispatch(setWishlist(response.data.wishlist))
      } catch (error) {
        toast.error('Failed to load wishlist')
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [token, dispatch])

  const handleRemove = async (productId: number) => {
    try {
      await wishlistAPI.remove(productId)
      dispatch(removeFromWishlist(productId))
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const handleAddToCart = (item: any) => {
    dispatch(addItem({
      id: item.product_id,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      quantity: 1,
      subtotal: item.price,
    }))
    toast.success('Added to cart!')
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12">Loading...</div>
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">My Wishlist</h1>
        <p className="text-gray-600 mb-8">Your wishlist is empty</p>
        <Link to="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.product_id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <Link to={`/products/${item.product_id}`} className="text-lg font-semibold hover:text-blue-600 transition">
                {item.name}
              </Link>
              <p className="text-2xl font-bold text-blue-600 my-2">${item.price.toFixed(2)}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WishlistPage
