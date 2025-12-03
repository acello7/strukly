"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"

interface TiltedCardProps {
  children: React.ReactNode
  className?: string
}

export function TiltedCard({ children, className = "" }: TiltedCardProps) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotX = ((y - centerY) / centerY) * 8
    const rotY = ((centerX - x) / centerX) * 8

    setRotateX(rotX)
    setRotateY(rotY)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: "1000px",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`${className}`}
    >
      {children}
    </motion.div>
  )
}
