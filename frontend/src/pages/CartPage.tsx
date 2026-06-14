import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { RootState } from '../store'
import { removeItem, updateQuantity, getCart } from '../store/slices/cartSlice'
import { cartAPI } from '../utils/api-endpoints'
import toast from 'react-hot-toast'

const CartPage: React.FC = () => {
  const dispatch = useDispatch()
  const { items, total } = useSelector((state: RootState) => state.cart)
  const { token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return
      try {
        const response = await cartAPI.get()
        // Update cart in Redux
      } catch (error) {
        toast.error('Failed to load cart')
      }
    }

    fetchCart()
  }, [token])

  const handleRemove = async (itemId: number) => {
    try {
      await cartAPI.remove(itemId)
      dispatch(removeItem(itemId))
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) return
    try {
      await cartAPI.update(itemId, quantity)
      dispatch(updateQuantity({ id: itemId, quantity }))
    } catch (error) {
      toast.error('Failed to update quantity')
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-600 mb-8">Your cart is empty</p>
        <Link to="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-6 border-b last:border-b-0">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <Link to={`/products/${item.product_id}`} className="text-lg font-semibold hover:text-blue-600">
                    {item.name}
                  </Link>
                  <p className="text-gray-600 mb-4">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${item.subtotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${(total * 1.1).toFixed(2)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-center block"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/products"
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition text-center block mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
