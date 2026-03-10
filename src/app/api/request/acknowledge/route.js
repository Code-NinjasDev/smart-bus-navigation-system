import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { request_id, action } = body

    // action must be "accepted" or "skipped"
    if (!request_id || !action) {
      return NextResponse.json(
        { success: false, message: 'request_id and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'accepted' && action !== 'skipped') {
      return NextResponse.json(
        { success: false, message: 'action must be "accepted" or "skipped"' },
        { status: 400 }
      )
    }

    // Update request status in Supabase
    const { data, error } = await supabase
      .from('pickup_requests')
      .update({ status: action })
      .eq('id', request_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `Pickup request ${action} successfully`,
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
    const requestId = searchParams.get('request_id')

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: 'request_id is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pickup_requests')
      .select(`
        id,
        status,
        passenger_count,
        created_at,
        stops (stop_name, stop_order),
        buses (bus_number)
      `)
      .eq('id', requestId)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      request: data
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}