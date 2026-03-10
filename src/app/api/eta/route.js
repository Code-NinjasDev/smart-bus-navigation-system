import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Helper function to calculate distance between two coordinates (in km)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
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
      .select('latitude, longitude, bus_number')
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

    // Calculate distance
    const distanceKm = getDistanceKm(
      bus.latitude,
      bus.longitude,
      stop.latitude,
      stop.longitude
    )

    // Assume average bus speed of 30 km/h in city
    const avgSpeedKmh = 30
    const etaMinutes = Math.round((distanceKm / avgSpeedKmh) * 60)

    return NextResponse.json({
      success: true,
      bus_number: bus.bus_number,
      stop_name: stop.stop_name,
      distance_km: distanceKm.toFixed(2),
      eta_minutes: etaMinutes
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}