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
    const stopId = searchParams.get('stop_id')
    const routeId = searchParams.get('route_id')

    if (!stopId || !routeId) {
      return NextResponse.json(
        { success: false, message: 'stop_id and route_id are required' },
        { status: 400 }
      )
    }

    // Get the requested stop details
    const { data: requestedStop, error: stopError } = await supabase
      .from('stops')
      .select('id, stop_order, latitude, longitude, stop_name')
      .eq('id', stopId)
      .single()

    if (stopError) throw stopError

    // Get all buses on this route
    const { data: buses, error: busError } = await supabase
      .from('buses')
      .select('id, bus_number, latitude, longitude, total_capacity, current_passengers, current_stop_index, direction')
      .eq('route_id', routeId)

    if (busError) throw busError

    // Get all stops for this route to determine bus position
    const { data: allStops, error: allStopsError } = await supabase
      .from('stops')
      .select('id, stop_order, latitude, longitude, stop_name')
      .eq('route_id', routeId)
      .order('stop_order', { ascending: true })

    if (allStopsError) throw allStopsError

    const avgSpeedMs = 30000 / 3600 // 30 km/h in m/s
    const requestedStopOrder = requestedStop.stop_order

    const eligibleBuses = []

    for (const bus of buses) {
      const currentStopIndex = bus.current_stop_index ?? 0
      const direction = bus.direction ?? 1
      const currentTargetStop = allStops[currentStopIndex]

      if (!currentTargetStop) continue

      const busCurrentStopOrder = currentTargetStop.stop_order

      // --- KEY LOGIC ---
      // Determine if this bus will reach the requested stop
      // based on its current position and direction

      let willReachStop = false

      if (direction === 1) {
        // Bus moving forward (stop 1 → last stop)
        // It will reach the requested stop only if requested stop
        // is AHEAD of or AT the bus current target
        willReachStop = requestedStopOrder >= busCurrentStopOrder

      } else {
        // Bus moving backward (last stop → stop 1)
        // It will reach the requested stop only if requested stop
        // is BEHIND or AT the bus current target (lower stop order)
        willReachStop = requestedStopOrder <= busCurrentStopOrder
      }

      if (!willReachStop) continue

      // Calculate total distance bus needs to travel to reach requested stop
      // Sum up distances stop by stop from bus current position
      let totalDistance = 0

      // First leg — bus current location to its current target stop
      const distToCurrentTarget = getDistanceMeters(
        bus.latitude, bus.longitude,
        currentTargetStop.latitude, currentTargetStop.longitude
      )
      totalDistance += distToCurrentTarget

      // Remaining legs — stop by stop until requested stop
      if (direction === 1) {
        // Forward — add distances from currentTargetStop to requestedStop
        for (let i = currentStopIndex; i < allStops.length - 1; i++) {
          const from = allStops[i]
          const to = allStops[i + 1]
          if (from.stop_order >= requestedStopOrder) break
          totalDistance += getDistanceMeters(
            from.latitude, from.longitude,
            to.latitude, to.longitude
          )
        }
      } else {
        // Reverse — add distances going backward to requestedStop
        for (let i = currentStopIndex; i > 0; i--) {
          const from = allStops[i]
          const to = allStops[i - 1]
          if (from.stop_order <= requestedStopOrder) break
          totalDistance += getDistanceMeters(
            from.latitude, from.longitude,
            to.latitude, to.longitude
          )
        }
      }

      // If bus is already at the requested stop — distance is 0
      const directDistance = getDistanceMeters(
        bus.latitude, bus.longitude,
        requestedStop.latitude, requestedStop.longitude
      )

      // Use direct distance if bus is very close to requested stop
      const finalDistance = directDistance < 100 ? directDistance : totalDistance

      const etaSeconds = finalDistance / avgSpeedMs
      const etaMinutes = Math.round(etaSeconds / 60)
      const vacantSeats = bus.total_capacity - bus.current_passengers

      eligibleBuses.push({
        id: bus.id,
        bus_number: bus.bus_number,
        distance_meters: Math.round(finalDistance),
        distance_km: (finalDistance / 1000).toFixed(2),
        eta_minutes: etaMinutes,
        eta_seconds: Math.round(etaSeconds),
        vacant_seats: vacantSeats,
        total_capacity: bus.total_capacity,
        current_passengers: bus.current_passengers,
        direction: direction === 1 ? 'forward' : 'reverse',
        heading_to: currentTargetStop.stop_name,
        stop_name: requestedStop.stop_name
      })
    }

    // Sort by ETA ascending — closest bus first
    eligibleBuses.sort((a, b) => a.eta_minutes - b.eta_minutes)

    return NextResponse.json({
      success: true,
      stop_name: requestedStop.stop_name,
      buses: eligibleBuses
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}