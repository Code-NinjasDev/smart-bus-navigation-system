import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { bus_id, latitude, longitude } = body

    if (!bus_id || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, message: 'bus_id, latitude and longitude are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('buses')
      .update({ latitude, longitude })
      .eq('id', bus_id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Bus location updated successfully',
      bus_id,
      latitude,
      longitude
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}