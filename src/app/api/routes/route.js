import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('route_number', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, routes: data })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}