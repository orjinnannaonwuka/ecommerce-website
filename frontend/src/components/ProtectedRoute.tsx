import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '../store'

interface ProtectedRouteProps {
  children: React.ReactNode
  admin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, admin = false }) => {
  const { user, token } = useSelector((state: RootState) => state.auth)

  if (!token || !user) {
    return <Navigate to="/login" />
  }

  if (admin && user.role !== 'admin') {
    return <Navigate to="/" />
  }

  return <>{children}</>
}

export default ProtectedRoute
