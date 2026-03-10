import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { bus_id, action } = body

    // action must be either "board" or "exit"
    if (!bus_id || !action) {
      return NextResponse.json(
        { success: false, message: 'bus_id and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'board' && action !== 'exit') {
      return NextResponse.json(
        { success: false, message: 'action must be "board" or "exit"' },
        { status: 400 }
      )
    }

    // Get current passengers count
    const { data: bus, error: fetchError } = await supabase
      .from('buses')
      .select('current_passengers, total_capacity')
      .eq('id', bus_id)
      .single()

    if (fetchError) throw fetchError

    // Calculate new count
    let newCount = bus.current_passengers

    if (action === 'board') {
      // Don't exceed total capacity
      if (newCount < bus.total_capacity) {
        newCount += 1
      } else {
        return NextResponse.json(
          { success: false, message: 'Bus is already full' },
          { status: 400 }
        )
      }
    } else if (action === 'exit') {
      // Don't go below 0
      if (newCount > 0) {
        newCount -= 1
      } else {
        return NextResponse.json(
          { success: false, message: 'Passenger count is already 0' },
          { status: 400 }
        )
      }
    }

    // Update in Supabase
    const { error: updateError } = await supabase
      .from('buses')
      .update({ current_passengers: newCount })
      .eq('id', bus_id)

    if (updateError) throw updateError

    const vacantSeats = bus.total_capacity - newCount

    return NextResponse.json({
      success: true,
      action,
      current_passengers: newCount,
      vacant_seats: vacantSeats
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}