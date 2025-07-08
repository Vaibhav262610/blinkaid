import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmergencyRequest from '@/lib/models/EmergencyRequest';

// GET - Get specific emergency request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const emergencyRequest = await EmergencyRequest.findById(id)
      .populate('userId', 'firstName lastName email phone')
      .populate('driverId', 'vehicleNumber driver.firstName driver.lastName');

    if (!emergencyRequest) {
      return NextResponse.json(
        { error: 'Emergency request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: emergencyRequest });

  } catch (error: any) {
    console.error('Error fetching emergency request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency request', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update emergency request status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Validate request ID
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    console.log('Updating emergency request with ID:', id);
    
    // Check if request has content
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object' },
        { status: 400 }
      );
    }

    console.log('Received request body:', body);

    const { status, driverId, estimatedArrival, driverNotes } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      
      // Update timing based on status
      switch (status) {
        case 'assigned':
          updateData.assignedTime = new Date();
          break;
        case 'en_route':
          updateData.estimatedArrival = estimatedArrival;
          break;
        case 'arrived':
          updateData.arrivalTime = new Date();
          break;
        case 'completed':
          updateData.completionTime = new Date();
          // Calculate response time
          const request = await EmergencyRequest.findById(id);
          if (request) {
            const responseTime = Math.round((Date.now() - request.requestTime.getTime()) / (1000 * 60));
            updateData.responseTime = responseTime;
          }
          break;
      }
    }

    if (driverId) {
      updateData.driverId = driverId;
    }

    if (driverNotes) {
      updateData.driverNotes = driverNotes;
    }

    // Check if emergency request exists
    const existingRequest = await EmergencyRequest.findById(id);
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Emergency request not found' },
        { status: 404 }
      );
    }

    console.log('Updating request with data:', updateData);

    const emergencyRequest = await EmergencyRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('userId', 'firstName lastName email phone')
    .populate('driverId', 'vehicleNumber driver.firstName driver.lastName');

    return NextResponse.json({
      message: 'Emergency request updated successfully',
      request: emergencyRequest
    });

  } catch (error: any) {
    console.error('Error updating emergency request:', error);
    return NextResponse.json(
      { error: 'Failed to update emergency request', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Cancel emergency request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const emergencyRequest = await EmergencyRequest.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        isActive: false 
      },
      { new: true }
    );

    if (!emergencyRequest) {
      return NextResponse.json(
        { error: 'Emergency request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Emergency request cancelled successfully',
      request: emergencyRequest
    });

  } catch (error: any) {
    console.error('Error cancelling emergency request:', error);
    return NextResponse.json(
      { error: 'Failed to cancel emergency request', details: error.message },
      { status: 500 }
    );
  }
} 