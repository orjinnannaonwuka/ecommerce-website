import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, LogOut, Menu } from 'lucide-react'
import { RootState } from '../store'
import { logout } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

const Header: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth)
  const { items: cartItems } = useSelector((state: RootState) => state.cart)
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist)
  const dispatch = useDispatch()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          E-Shop
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/products" className="hover:text-blue-600 transition">
            Products
          </Link>
          {user && (
            <>
              <Link to="/orders" className="hover:text-blue-600 transition">
                Orders
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-600 transition font-semibold text-purple-600">
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Side Icons */}
        <div className="flex gap-4 items-center">
          {token ? (
            <>
              <Link to="/wishlist" className="relative hover:text-blue-600 transition">
                <Heart size={24} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative hover:text-blue-600 transition">
                <ShoppingCart size={24} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
