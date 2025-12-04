import { NextResponse } from 'next/server'
import { getFirebaseDiagnostics } from '@/lib/firebase'

export async function GET() {
  try {
    const diag = getFirebaseDiagnostics()

    // Mask sensitive env values but show presence and length
    const mask = (v: any) => {
      if (v == null) return null
      const s = String(v)
      if (s.length <= 6) return '******'
      return s.slice(0, 3) + '...' + s.slice(-3)
    }

    const envs = {
      NEXT_PUBLIC_FIREBASE_API_KEY: mask(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: mask(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
      NEXT_PUBLIC_FIREBASE_DATABASE_URL: mask(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL),
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: mask(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: mask(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: mask(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
      NEXT_PUBLIC_FIREBASE_APP_ID: mask(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: mask(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
    }

    return NextResponse.json({ ok: true, diag, envs })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
