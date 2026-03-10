import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get('route_id')

    let query = supabase
      .from('stops')
      .select('*')
      .order('stop_order', { ascending: true })

    if (routeId) {
      query = query.eq('route_id', routeId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, stops: data })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}