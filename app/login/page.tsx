"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"

export default function LoginPage() {
  const { language } = useLanguage()
  const t = translations[language]

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
              <LanguageToggle />
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
              {t.login_title}
            </motion.h1>
            <motion.p className="text-muted-foreground" variants={itemVariants}>
              {t.dokumentasi_struk}
            </motion.p>
          </motion.div>

          {/* Login Form */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 shadow-lg">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium">
                      {t.password}
                    </label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      {t.lupa_password}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    {isLoading ? t.laporan : t.masuk}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div className="text-center space-y-4" variants={itemVariants}>
            <p className="text-sm text-muted-foreground">
              {t.belum_punya_akun}{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                {t.daftar_sekarang}
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
