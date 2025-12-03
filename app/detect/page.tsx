"use client"

import type React from "react"
import { useState, useRef } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Edit2, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { detectReceiptOCR, autoCorrectItemName } from "@/components/ocr-detector"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { LanguageToggle } from "@/components/language-toggle"

interface Item {
  id: string
  name: string
  quantity: number
  price: number
}

interface Receipt {
  id: string
  merchant: string
  date: string
  items: Item[]
  total: number
  timestamp: Date
}

export default function DetectPage() {
  const { language } = useLanguage()
  const t = translations[language]

  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Item | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [merchant, setMerchant] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        setUploadedImage(reader.result as string)

        setIsProcessing(true)
        try {
          const result = await detectReceiptOCR(reader.result as string)
          setItems(
            result.items.map((item, idx) => ({
              id: idx.toString(),
              name: autoCorrectItemName(item.name),
              quantity: item.quantity,
              price: item.price,
            })),
          )
          setMerchant(result.merchant)
        } catch (error) {
          console.error("OCR detection error:", error)
        } finally {
          setIsProcessing(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setEditValues({ ...item })
  }

  const handleSaveEdit = () => {
    if (editValues) {
      setItems(items.map((item) => (item.id === editingId ? editValues : item)))
      setEditingId(null)
      setEditValues(null)
    }
  }

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleAddItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: "Item Baru",
      quantity: 1,
      price: 0,
    }
    setItems([...items, newItem])
  }

  const totalRevenue = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  const handleSaveReceipt = () => {
    if (items.length === 0) return

    const receipt: Receipt = {
      id: Date.now().toString(),
      merchant: merchant || "Merchant Tidak Diketahui",
      date: new Date().toLocaleDateString("id-ID"),
      items,
      total: totalRevenue,
      timestamp: new Date(),
    }

    setReceipts([...receipts, receipt])

    // Reset form
    setUploadedImage(null)
    setItems([])
    setMerchant("")

    // Show success message
    alert("Struk berhasil disimpan!")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">{t.ambil_foto_struk}</h1>
            </div>
            <div className="flex gap-2">
              {/* Language Toggle */}
              <LanguageToggle />
              <Link href="/revenue">
                <Button variant="outline">{t.laporan}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="grid md:grid-cols-2 gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Image Upload */}
          <motion.div className="space-y-4" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-2xl font-bold">{t.ambil_foto_struk}</h2>
            <Card className="border-border/50 border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 transition-colors">
              <label className="cursor-pointer block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadedImage ? (
                  <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt={t.ganti_foto}
                      className="w-full rounded-lg max-h-96 object-cover"
                    />
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={(e) => {
                        e.preventDefault()
                        setUploadedImage(null)
                        setItems([])
                        setMerchant("")
                      }}
                    >
                      {t.ganti_foto}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Camera className="w-12 h-12 text-primary" />
                    </motion.div>
                    <div className="text-center space-y-2">
                      <p className="font-semibold">{t.klik_drag}</p>
                      <p className="text-sm text-muted-foreground">{t.png_jpg}</p>
                    </div>
                  </div>
                )}
              </label>
            </Card>
          </motion.div>

          {/* Items Detected */}
          <motion.div className="space-y-4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-2xl font-bold">{t.data_terdeteksi}</h2>
            <Card className="border-border/50 p-6 space-y-4">
              {merchant && (
                <motion.div
                  className="p-3 bg-primary/10 rounded-lg border border-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-sm text-muted-foreground">{t.merchant}</p>
                  <p className="font-semibold text-primary">{merchant}</p>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  className="flex items-center gap-2 py-4 justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{t.mendeteksi_struk}</p>
                </motion.div>
              )}

              {/* Items List */}
              <AnimatePresence>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {editingId === item.id ? (
                        <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
                          <input
                            type="text"
                            value={editValues?.name || ""}
                            onChange={(e) => setEditValues(editValues ? { ...editValues, name: e.target.value } : null)}
                            className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
                            placeholder={t.email}
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editValues?.quantity || 0}
                              onChange={(e) =>
                                setEditValues(
                                  editValues ? { ...editValues, quantity: Number.parseInt(e.target.value) || 0 } : null,
                                )
                              }
                              className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm"
                              placeholder={t.qty}
                            />
                            <input
                              type="number"
                              value={editValues?.price || 0}
                              onChange={(e) =>
                                setEditValues(
                                  editValues ? { ...editValues, price: Number.parseInt(e.target.value) || 0 } : null,
                                )
                              }
                              className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm"
                              placeholder={t.harga}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-primary text-white hover:bg-primary/90"
                              onClick={handleSaveEdit}
                            >
                              <Save className="w-4 h-4 mr-1" /> {t.simpan}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-transparent"
                              onClick={() => setEditingId(null)}
                            >
                              {t.batal}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity}x @ Rp {item.price.toLocaleString("id-ID")}
                            </p>
                            <p className="font-semibold text-primary">
                              Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>

              <Button variant="outline" className="w-full bg-transparent" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" /> {t.tambah_item}
              </Button>

              {/* Total */}
              {items.length > 0 && (
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t.total}</span>
                    <span className="text-2xl font-bold text-primary">Rp {totalRevenue.toLocaleString("id-ID")}</span>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    onClick={handleSaveReceipt}
                    disabled={isProcessing}
                  >
                    {t.simpan_database}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
