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

    // Get bus current state
    const { data: bus, error: busError } = await supabase
      .from('buses')
      .select('latitude, longitude, route_id, current_stop_index, direction')
      .eq('id', bus_id)
      .single()

    if (busError) throw busError

    // Get all stops for this route ordered by stop_order
    const { data: stops, error: stopsError } = await supabase
      .from('stops')
      .select('id, latitude, longitude, stop_order, stop_name')
      .eq('route_id', bus.route_id)
      .order('stop_order', { ascending: true })

    if (stopsError) throw stopsError

    const totalStops = stops.length
    let currentStopIndex = bus.current_stop_index ?? 0
    let direction = bus.direction ?? 1 // 1 = forward, -1 = reverse
    const targetStop = stops[currentStopIndex]

    // Distance to current target stop
    const distanceToTarget = getDistanceMeters(
      bus.latitude, bus.longitude,
      targetStop.latitude, targetStop.longitude
    )

    let newLat = bus.latitude
    let newLng = bus.longitude
    let newStopIndex = currentStopIndex
    let newDirection = direction
    let autoCleared = null
    let busStatus = 'on_the_way'

    if (distanceToTarget <= 50) {
      // ✅ Bus arrived at this stop — snap to exact stop location
      newLat = targetStop.latitude
      newLng = targetStop.longitude
      busStatus = 'arrived'

      // Auto clear pending pickup requests for this stop
      const { error: clearError } = await supabase
        .from('pickup_requests')
        .update({ status: 'completed' })
        .eq('stop_id', targetStop.id)
        .eq('bus_id', bus_id)
        .eq('status', 'pending')

      if (!clearError) autoCleared = targetStop.stop_name

      // Calculate next stop index based on direction
      const nextIndex = currentStopIndex + direction

      if (nextIndex >= totalStops) {
        // Reached last stop — reverse direction, go back
        newDirection = -1
        newStopIndex = totalStops - 2 // second to last
      } else if (nextIndex < 0) {
        // Reached first stop going backward — reverse direction, go forward
        newDirection = 1
        newStopIndex = 1 // second stop
      } else {
        newStopIndex = nextIndex
      }

    } else {
      // 🚌 Still moving — advance 200m toward target stop per tick
      const MOVE_METERS = 200

      const latDiff = targetStop.latitude - bus.latitude
      const lngDiff = targetStop.longitude - bus.longitude
      const totalDist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)

      // Normalize and move fixed distance
      const moveRatio = Math.min(1, (MOVE_METERS / 111000) / totalDist)

      newLat = bus.latitude + latDiff * moveRatio
      newLng = bus.longitude + lngDiff * moveRatio

      if (distanceToTarget <= 500) busStatus = 'arriving_soon'
    }

    // Update bus in Supabase
    const { error: updateError } = await supabase
      .from('buses')
      .update({
        latitude: newLat,
        longitude: newLng,
        current_stop_index: newStopIndex,
        direction: newDirection
      })
      .eq('id', bus_id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      bus_status: busStatus,
      direction: newDirection === 1 ? 'forward' : 'reverse',
      moving_toward: stops[newStopIndex]?.stop_name,
      distance_to_stop_meters: Math.round(distanceToTarget),
      auto_cleared_stop: autoCleared
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}