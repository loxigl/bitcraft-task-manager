"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient, RegisterRequest } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    guild: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [guildOption, setGuildOption] = useState<string>("the_vermilion_expanse")
  const [customGuild, setCustomGuild] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Определяем финальное название гильдии
    const finalGuild = guildOption === "other" ? customGuild : "The Vermilion Expanse"
    const submitData = { ...formData, guild: finalGuild }

    try {
      const response = await apiClient.register(submitData)
      
      if (response.success && response.data) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('currentUser', JSON.stringify(response.data.user))
        
        toast({
          title: "Registration successful!",
          description: "Welcome to BitCraft Task Manager!",
        })
        
        onSuccess()
      } else {
        toast({
          title: "Registration error",
          description: response.message || "An error occurred during registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
          <CardTitle className="text-2xl">Sign up for BitCraft</CardTitle>
          <CardDescription>
            Create a new account to manage guild tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                name="name"
                placeholder="Character name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
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
                placeholder="Password (minimum 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
            <div>
              <Select 
                value={guildOption} 
                onValueChange={setGuildOption}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your guild" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="the_vermilion_expanse">The Vermilion Expanse</SelectItem>
                  <SelectItem value="other">Other (custom guild name)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {guildOption === "other" && (
              <div>
                <Input
                  type="text"
                  placeholder="Enter your guild name"
                  value={customGuild}
                  onChange={(e) => setCustomGuild(e.target.value)}
                  disabled={isLoading}
                  required={guildOption === "other"}
                />
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 