import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

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

    const { data, error } = await supabase
      .from('buses')
      .select('bus_number, total_capacity, current_passengers')
      .eq('id', busId)
      .single()

    if (error) throw error

    const vacantSeats = data.total_capacity - data.current_passengers

    return NextResponse.json({
      success: true,
      bus_number: data.bus_number,
      total_capacity: data.total_capacity,
      current_passengers: data.current_passengers,
      vacant_seats: vacantSeats
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}