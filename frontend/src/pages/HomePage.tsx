import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { productAPI } from '../utils/api-endpoints'
import { setProducts } from '../store/slices/productSlice'
import toast from 'react-hot-toast'

const HomePage: React.FC = () => {
  const dispatch = useDispatch()
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productAPI.getAll({ limit: 8 })
        setFeaturedProducts(response.data.products)
        dispatch(setProducts(response.data.products))
      } catch (error) {
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [dispatch])

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to E-Shop</h1>
        <p className="text-xl mb-6">Discover amazing products at unbeatable prices</p>
        <Link
          to="/products"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Shop Now
        </Link>
      </div>

      {/* Featured Products */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">🚚</div>
          <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
          <p className="text-gray-600">On orders over $50</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
          <p className="text-gray-600">100% secure transactions</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">📞</div>
          <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
          <p className="text-gray-600">Always here to help</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
