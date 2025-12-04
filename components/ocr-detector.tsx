"use client"

import { createWorker } from "tesseract.js"

interface OCRResult {
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  merchant: string
  date: string
}

// Lazily create a single Tesseract worker to avoid reloading models repeatedly.
let workerPromise: Promise<any> | null = null
async function getWorker() {
  if (!workerPromise) {
    const worker = createWorker({
      logger: () => undefined,
    })
    workerPromise = (async () => {
      await worker.load()
      // Load English + Indonesian (if available). Tesseract will download traineddata on first run.
      try {
        await worker.loadLanguage("eng+ind")
        await worker.initialize("eng+ind")
      } catch (e) {
        // Fallback to English only if ind isn't available
        await worker.loadLanguage("eng")
        await worker.initialize("eng")
      }
      return worker
    })()
  }
  return workerPromise
}

// Helper: parse a number string like "12.345,67" or "12,345.67" into integer (rounding)
function parseCurrencyToInt(s: string): number {
  if (!s) return 0
  // Remove non-digit except , and .
  const cleaned = s.replace(/[^0-9.,-]/g, "")
  // If both . and , exist, assume dot thousands and comma decimals (European), remove dots
  if (cleaned.indexOf(".") !== -1 && cleaned.indexOf(",") !== -1) {
    const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".")
    return Math.round(parseFloat(normalized) || 0)
  }
  // If only comma present, replace comma with dot
  if (cleaned.indexOf(",") !== -1 && cleaned.indexOf(".") === -1) {
    const normalized = cleaned.replace(/,/g, ".")
    return Math.round(parseFloat(normalized) || 0)
  }
  // Otherwise remove non-digits and parse
  const digits = cleaned.replace(/[^0-9]/g, "")
  return Math.round(parseFloat(digits) || 0)
}

// Heuristic OCR + lightweight parsing for receipts
async function detectReceiptOCR(imageData: string): Promise<OCRResult> {
  const worker = await getWorker()
  const { data } = await worker.recognize(imageData)
  const text: string = data?.text || ""

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const merchant = lines.length > 0 ? lines[0] : "Unknown Merchant"

  // Find a date in the text
  let date = ""
  const dateRegexes = [
    /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/,
    /\b(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/,
  ]
  for (const r of dateRegexes) {
    const m = text.match(r)
    if (m) {
      date = m[1]
      break
    }
  }
  if (!date) date = new Date().toLocaleDateString()

  // Find total by searching lines containing keywords then falling back to largest number found
  const totalKeywords = [/total/i, /subtotal/i, /grand total/i, /jumlah/i]
  let total = 0
  for (const line of lines) {
    if (totalKeywords.some((k) => k.test(line))) {
      const numMatch = line.match(/([0-9\.,]{2,})/g)
      if (numMatch && numMatch.length > 0) {
        total = parseCurrencyToInt(numMatch[numMatch.length - 1])
        break
      }
    }
  }

  if (total === 0) {
    // fallback: pick the largest numeric-looking token in the OCR output
    const allNums = [...text.matchAll(/([0-9\.,]{2,})/g)].map((m) => m[1])
    const parsed = allNums.map((s) => parseCurrencyToInt(s))
    if (parsed.length) total = Math.max(...parsed)
  }

  // Extract item-like lines: lines that contain both text and a number (price)
  const items: { name: string; quantity: number; price: number }[] = []
  for (const line of lines.slice(1)) {
    // skip lines that look like totals/dates
    if (totalKeywords.some((k) => k.test(line))) continue
    if (/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/.test(line)) continue

    const nums = [...line.matchAll(/([0-9\.,]{2,})/g)].map((m) => m[1])
    if (nums.length === 0) continue
    // assume last number on the line is the price
    const priceRaw = nums[nums.length - 1]
    const price = parseCurrencyToInt(priceRaw)
    // name is text before that number
    const idx = line.lastIndexOf(priceRaw)
    const name = (idx > 0 ? line.substring(0, idx) : line).replace(/[^a-zA-Z0-9\s\-\u00C0-\u017F]/g, "").trim()
    if (!name) continue
    items.push({ name, quantity: 1, price })
    if (items.length >= 20) break
  }

  // If no items detected, fallback to a single item with the total
  if (items.length === 0) {
    items.push({ name: merchant || "Item", quantity: 1, price: total })
  }

  return {
    items,
    total,
    merchant,
    date,
  }
}

// Auto-correct common Indonesian food names
function autoCorrectItemName(name: string): string {
  const corrections: Record<string, string> = {
    nasi_goreng: "Nasi Goreng",
    mie_goreng: "Mie Goreng",
    soto_ayam: "Soto Ayam",
    gado_gado: "Gado-Gado",
    perkedel: "Perkedel",
    lumpia: "Lumpia",
    kopi: "Kopi",
    teh: "Teh",
    es: "Es",
    air: "Air Mineral",
  }

  const normalized = name.toLowerCase().replace(/\s+/g, "_")
  return corrections[normalized] || name
}

export { detectReceiptOCR, autoCorrectItemName }
