import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmergencyRequest from '@/lib/models/EmergencyRequest';
import User from '@/lib/models/User';

// GET - Fetch emergency requests (for drivers and admins)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const driverId = searchParams.get('driverId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let query: any = { isActive: true };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by user (for user's own requests)
    if (userId) {
      query.userId = userId;
    }

    // Filter by driver (for driver's assigned requests)
    if (driverId) {
      query.driverId = driverId;
    }

    // For drivers, show only pending requests or their assigned requests
    if (driverId && !status) {
      query.$or = [
        { status: 'pending' },
        { driverId: driverId }
      ];
    }

    const [requests, total] = await Promise.all([
      EmergencyRequest.find(query)
        .populate('userId', 'firstName lastName email phone')
        .populate('driverId', 'vehicleNumber driver.firstName driver.lastName')
        .sort({ requestTime: -1 })
        .skip(skip)
        .limit(limit),
      EmergencyRequest.countDocuments(query)
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching emergency requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency requests', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new emergency request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['emergencyType', 'pickupLocation', 'patientDetails', 'description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the emergency request
    const emergencyRequest = new EmergencyRequest({
      ...body,
      requestTime: new Date(),
      status: 'pending'
    });

    await emergencyRequest.save();

    // Populate user and driver details for response
    await emergencyRequest.populate('userId', 'firstName lastName email phone');
    await emergencyRequest.populate('driverId', 'vehicleNumber driver.firstName driver.lastName');

    return NextResponse.json({
      message: 'Emergency request created successfully',
      request: emergencyRequest
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating emergency request:', error);
    return NextResponse.json(
      { error: 'Failed to create emergency request', details: error.message },
      { status: 500 }
    );
  }
} 