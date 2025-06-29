"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

export function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true)

  const handleSuccess = () => {
    // Удаляем window.location.reload() - позволяем React обновить состояние естественно
    // UserContext уже обновил currentUser, что должно автоматически переключить интерфейс
  }

  const switchToRegister = () => setIsLogin(false)
  const switchToLogin = () => setIsLogin(true)

  if (isLogin) {
    return (
      <LoginForm 
        onSuccess={handleSuccess}
        onSwitchToRegister={switchToRegister}
      />
    )
  }

  return (
    <RegisterForm 
      onSuccess={handleSuccess}
      onSwitchToLogin={switchToLogin}
    />
  )
} 