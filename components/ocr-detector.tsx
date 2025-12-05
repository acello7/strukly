export interface OCRResult {
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  merchant: string
  date: string
}

// Mock OCR detection function
export async function detectReceiptOCR(imageData: string): Promise<OCRResult> {
  // Simulate OCR processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock detection results
  const mockDetections = [
    {
      items: [
        { name: "Nasi Kuning", quantity: 2, price: 28000 },
        { name: "Ayam Goreng", quantity: 1, price: 35000 },
        { name: "Teh Panas", quantity: 3, price: 8000 },
      ],
      total: 107000,
      merchant: "Warung Makan Enak",
      date: new Date().toLocaleDateString("id-ID"),
    },
  ]

  return mockDetections[Math.floor(Math.random() * mockDetections.length)]
}

// Auto-correct common Indonesian food names
export function autoCorrectItemName(name: string): string {
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
