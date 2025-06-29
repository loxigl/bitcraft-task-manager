"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginRequest } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/UserContext"

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  const { login, loading: isLoading } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
      
    const result = await login(formData)
        
    if (result.success) {
        toast({
          title: "Welcome!",
        description: "Successfully signed in",
        })
        
        onSuccess()
      } else {
        toast({
          title: "Sign in error",
        description: result.message || "Invalid email or password",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">BitCraft Task Manager</CardTitle>
          <CardDescription>
            Sign in using your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={onSwitchToRegister}
              disabled={isLoading}
            >
              Don't have an account? Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 