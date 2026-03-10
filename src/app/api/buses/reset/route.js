import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { bus_id } = body

    if (!bus_id) {
      return NextResponse.json(
        { success: false, message: 'bus_id is required' },
        { status: 400 }
      )
    }

    const { data: bus, error: busError } = await supabase
      .from('buses')
      .select('route_id')
      .eq('id', bus_id)
      .single()

    if (busError) throw busError

    const { data: firstStop, error: stopError } = await supabase
      .from('stops')
      .select('latitude, longitude')
      .eq('route_id', bus.route_id)
      .order('stop_order', { ascending: true })
      .limit(1)
      .single()

    if (stopError) throw stopError

    // Stagger buses — odd bus_id starts 2km away, even starts 4km away
    const offset = bus_id % 2 === 1 ? 0.02 : 0.04

    const startLat = firstStop.latitude - offset
    const startLng = firstStop.longitude - offset

    const { error: updateError } = await supabase
      .from('buses')
      .update({
        latitude: startLat,
        longitude: startLng,
        current_stop_index: 0
      })
      .eq('id', bus_id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Bus reset to starting position',
      start_latitude: startLat,
      start_longitude: startLng
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}