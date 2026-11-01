import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Simple JWT token generation (in production, use a proper library)
function generateToken(email: string): string {
  const payload = {
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  }
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64')
  const secret = process.env.ADMIN_JWT_SECRET || 'your-secret-key'
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
  return `${header}.${body}.${signature}`
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Query admin user from database (use maybeSingle() to avoid error on empty result)
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    if (!adminUser) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    // In production, use bcrypt to verify passwords
    // For now, we'll do a simple comparison (not recommended for production)
    const passwordHash = Buffer.from(password).toString('base64')

    if (adminUser.password_hash !== passwordHash) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    // Generate token
    const token = generateToken(email)

    return NextResponse.json({
      token,
      email,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
