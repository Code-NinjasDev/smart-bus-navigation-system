import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { bus_id, stop_id } = body

    if (!bus_id || !stop_id) {
      return NextResponse.json(
        { success: false, message: 'bus_id and stop_id are required' },
        { status: 400 }
      )
    }

    // Clear all pending pickup requests for this stop and bus
    const { error: clearError } = await supabase
      .from('pickup_requests')
      .update({ status: 'completed' })
      .eq('stop_id', stop_id)
      .eq('bus_id', bus_id)
      .eq('status', 'pending')

    if (clearError) throw clearError

    // Get total passengers that were waiting at this stop
    const { data: completedRequests } = await supabase
      .from('pickup_requests')
      .select('passenger_count')
      .eq('stop_id', stop_id)
      .eq('bus_id', bus_id)
      .eq('status', 'completed')

    const totalBoarded = completedRequests?.reduce(
      (sum, r) => sum + r.passenger_count, 0
    ) || 0

    return NextResponse.json({
      success: true,
      message: 'Stop marked as reached. Requests cleared.',
      total_boarded: totalBoarded
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

// GET — fetch all pending requests grouped by stop for a bus
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const busId = searchParams.get('bus_id')

    if (!busId) {
      return NextResponse.json(
        { success: false, message: 'bus_id is required' },
        { status: 400 }
      )
    }

    // Get all pending requests for this bus with stop info
    const { data, error } = await supabase
      .from('pickup_requests')
      .select(`
        stop_id,
        passenger_count,
        stops (stop_name, stop_order)
      `)
      .eq('bus_id', busId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error

    // Group by stop and sum passenger counts
    const grouped = {}
    data.forEach(req => {
      const stopId = req.stop_id
      if (!grouped[stopId]) {
        grouped[stopId] = {
          stop_id: stopId,
          stop_name: req.stops?.stop_name,
          stop_order: req.stops?.stop_order,
          total_passengers: 0
        }
      }
      grouped[stopId].total_passengers += req.passenger_count
    })

    // Convert to array sorted by stop order
    const stops = Object.values(grouped).sort(
      (a, b) => a.stop_order - b.stop_order
    )

    return NextResponse.json({ success: true, stops })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}