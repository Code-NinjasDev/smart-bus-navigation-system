import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { fcm_token, stop_id, passenger_count, request_id } = body

    if (!fcm_token) {
      return NextResponse.json(
        { success: false, message: 'fcm_token is required' },
        { status: 400 }
      )
    }

    // Build FCM message
    const message = {
      token: fcm_token,
      notification: {
        title: '🚌 New Pickup Request!',
        body: `${passenger_count} passenger(s) waiting at stop #${stop_id}`
      },
      data: {
        stop_id: String(stop_id),
        passenger_count: String(passenger_count),
        request_id: String(request_id)
      }
    }

    // Send via Firebase Admin SDK
    const admin = require('firebase-admin')

    // Initialize Firebase Admin only once
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      })
    }

    const response = await admin.messaging().send(message)

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      firebase_response: response
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}