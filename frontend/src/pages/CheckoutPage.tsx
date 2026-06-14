import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { RootState } from '../store'
import { orderAPI } from '../utils/api-endpoints'
import { clearCart } from '../store/slices/cartSlice'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '')

const CheckoutFormContent: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, total } = useSelector((state: RootState) => state.cart)
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    shippingAddress: '',
    billingAddress: '',
    cardholderName: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.shippingAddress || !formData.billingAddress) {
      toast.error('Please fill in all address fields')
      return
    }

    try {
      setLoading(true)

      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping_address: formData.shippingAddress,
        billing_address: formData.billingAddress,
      }

      const response = await orderAPI.create(orderData)

      if (response.data.order) {
        dispatch(clearCart())
        toast.success('Order placed successfully!')
        navigate('/orders')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            {/* Shipping Address */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Shipping Address</label>
              <textarea
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleInputChange}
                placeholder="Enter your shipping address"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows={4}
              />
            </div>

            {/* Billing Address */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Billing Address</label>
              <textarea
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleInputChange}
                placeholder="Enter your billing address"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows={4}
              />
            </div>

            {/* Cardholder Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Cardholder Name</label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                placeholder="Enter cardholder name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax (10%)</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${(total * 1.1).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CheckoutPage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent />
    </Elements>
  )
}

export default CheckoutPage
