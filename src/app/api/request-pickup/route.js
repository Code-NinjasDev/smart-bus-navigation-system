import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { bus_id, stop_id, passenger_count, user_id } = body

    if (!bus_id || !stop_id) {
      return NextResponse.json(
        { success: false, message: 'bus_id and stop_id are required' },
        { status: 400 }
      )
    }

    // Check if this user already notified this bus at this stop
    if (user_id) {
      const { data: existing } = await supabase
        .from('pickup_requests')
        .select('id, status')
        .eq('bus_id', bus_id)
        .eq('stop_id', stop_id)
        .eq('user_id', user_id)
        .neq('status', 'completed')
        .single()

      if (existing) {
        return NextResponse.json({
          success: false,
          already_notified: true,
          message: 'You have already notified this bus at this stop'
        }, { status: 400 })
      }
    }

    // Save pickup request to Supabase
    const { data, error } = await supabase
      .from('pickup_requests')
      .insert([{
        bus_id,
        stop_id,
        passenger_count: passenger_count || 1,
        user_id: user_id || null,
        status: 'pending'
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Driver notified successfully',
      request_id: data.id,
      status: data.status
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const busId = searchParams.get('bus_id')

    let query = supabase
      .from('pickup_requests')
      .select(`
        id,
        passenger_count,
        status,
        created_at,
        stops (stop_name, stop_order, latitude, longitude)
      `)
      .order('created_at', { ascending: false })

    if (busId) query = query.eq('bus_id', busId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, requests: data })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}