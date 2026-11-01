import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@example.com')
      .maybeSingle()

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists' },
        { status: 200 }
      )
    }

    // Create default admin user with password 'admin123'
    const defaultPassword = 'admin123'
    const passwordHash = Buffer.from(defaultPassword).toString('base64')

    const { error } = await supabase.from('admin_users').insert({
      email: 'admin@example.com',
      password_hash: passwordHash,
    })

    if (error) {
      console.error('Error creating admin user:', error)
      return NextResponse.json(
        { message: 'Failed to create admin user', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Admin user created successfully',
        email: 'admin@example.com',
        password: 'admin123',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
