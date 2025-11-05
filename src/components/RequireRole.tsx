// src/components/RequireRole.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'

type Props = {
  role: 'admin' | 'recruiter' | 'student'
  children: React.ReactNode
}

const RequireRole: React.FC<Props> = ({ role, children }) => {
  let u: any = null
  try { u = JSON.parse(localStorage.getItem('user') || 'null') } catch {}
  if (!u || u.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}

export default RequireRole
