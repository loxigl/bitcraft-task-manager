"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

export function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true)

  const handleLoginSuccess = () => {
    // For login - do nothing, let UserContext handle the state update
  }

  const handleRegisterSuccess = () => {
    // After successful registration, redirect to login
    setIsLogin(true)
  }

  const switchToRegister = () => setIsLogin(false)
  const switchToLogin = () => setIsLogin(true)

  if (isLogin) {
    return (
      <LoginForm 
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={switchToRegister}
      />
    )
  }

  return (
    <RegisterForm 
      onSuccess={handleRegisterSuccess}
      onSwitchToLogin={switchToLogin}
    />
  )
} 