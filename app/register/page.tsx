"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const { language } = useLanguage()
  const t = translations[language]

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }

    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">{t.laporan}</span>
            </Link>
            <div className="flex gap-2">
              {/* Language Toggle */}
              <LanguageToggle />
              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Logo and Title */}
          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
            </motion.div>
            <motion.h1 className="text-3xl font-bold" variants={itemVariants}>
              {t.register_title}
            </motion.h1>
            <motion.p className="text-muted-foreground" variants={itemVariants}>
              {t.mulai_deteksi}
            </motion.p>
          </motion.div>

          {/* Register Form */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 shadow-lg">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <motion.div
                    className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive flex gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="name" className="block text-sm font-medium">
                    {t.email}
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={language === "id" ? "Nama bisnis Anda" : "Your business name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-input border-border/50 focus:border-primary transition-colors"
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="email" className="block text-sm font-medium">
                    {t.email}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input border-border/50 focus:border-primary transition-colors"
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="password" className="block text-sm font-medium">
                    {t.password}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input border-border/50 focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === "id" ? "Minimal 8 karakter" : "At least 8 characters"}
                  </p>
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    {t.confirm_password}
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-input border-border/50 focus:border-primary transition-colors"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (language === "id" ? "Sedang Membuat Akun..." : "Creating Account...") : t.daftar}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>

          {/* Sign In Link */}
          <motion.div className="text-center" variants={itemVariants}>
            <p className="text-sm text-muted-foreground">
              {t.sudah_punya_akun}{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                {t.login_sekarang}
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
