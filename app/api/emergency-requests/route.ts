import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { EmergencyRequest, User } from '@/lib/models';

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
    console.log('Starting emergency request creation...');
    await dbConnect();
    console.log('Database connected successfully');
    
    const body = await request.json();
    console.log('Received request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    const requiredFields = ['emergencyType', 'pickupLocation', 'patientDetails', 'description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.error(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate patientDetails structure - phone is optional for emergencies
    if (!body.patientDetails.name) {
      console.error('Missing patientDetails.name');
      return NextResponse.json(
        { error: 'Patient name is required' },
        { status: 400 }
      );
    }

    console.log('Creating emergency request with data:', {
      emergencyType: body.emergencyType,
      patientDetails: body.patientDetails,
      pickupLocation: body.pickupLocation
    });

    // Create the emergency request (userId is optional for emergency requests)
    const emergencyRequest = new EmergencyRequest({
      ...body,
      requestTime: new Date(),
      status: 'pending'
    });

    console.log('Emergency request object created, saving to database...');
    await emergencyRequest.save();
    console.log('Emergency request saved successfully with ID:', emergencyRequest._id);

    // Only populate if userId exists
    if (emergencyRequest.userId) {
      console.log('Populating userId...');
      await emergencyRequest.populate('userId', 'firstName lastName email phone');
    }
    if (emergencyRequest.driverId) {
      console.log('Populating driverId...');
      await emergencyRequest.populate('driverId', 'vehicleNumber driver.firstName driver.lastName');
    }

    console.log('Emergency request created successfully');
    return NextResponse.json({
      message: 'Emergency request created successfully',
      request: emergencyRequest
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating emergency request:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    if (error.code) {
      console.error('Error code:', error.code);
    }
    return NextResponse.json(
      { error: 'Failed to create emergency request', details: error.message },
      { status: 500 }
    );
  }
} 