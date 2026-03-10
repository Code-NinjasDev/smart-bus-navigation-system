import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const busId = searchParams.get('bus_id')
    const stopId = searchParams.get('stop_id')

    if (!busId || !stopId) {
      return NextResponse.json(
        { success: false, message: 'bus_id and stop_id are required' },
        { status: 400 }
      )
    }

    // Get bus current location
    const { data: bus, error: busError } = await supabase
      .from('buses')
      .select('latitude, longitude, bus_number, total_capacity, current_passengers')
      .eq('id', busId)
      .single()

    if (busError) throw busError

    // Get stop location
    const { data: stop, error: stopError } = await supabase
      .from('stops')
      .select('latitude, longitude, stop_name')
      .eq('id', stopId)
      .single()

    if (stopError) throw stopError

    // Calculate distance in meters
    const distanceMeters = getDistanceMeters(
      bus.latitude, bus.longitude,
      stop.latitude, stop.longitude
    )

    // Calculate ETA
    const avgSpeedMs = 30000 / 3600 // 30 km/h in m/s
    const etaSeconds = Math.round(distanceMeters / avgSpeedMs)
    const etaMinutes = Math.round(etaSeconds / 60)

    // Determine bus status
    let status = 'on_the_way'
    if (distanceMeters <= 100) {
      status = 'arrived'
    } else if (distanceMeters <= 500) {
      status = 'arriving_soon'
    }

    const vacantSeats = bus.total_capacity - bus.current_passengers

    return NextResponse.json({
      success: true,
      bus_number: bus.bus_number,
      stop_name: stop.stop_name,
      distance_meters: Math.round(distanceMeters),
      distance_km: (distanceMeters / 1000).toFixed(2),
      eta_minutes: etaMinutes,
      eta_seconds: etaSeconds,
      vacant_seats: vacantSeats,
      status // 'on_the_way' | 'arriving_soon' | 'arrived'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}