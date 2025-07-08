import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Ambulance } from '@/lib/models';

// GET all ambulances
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const vehicleType = searchParams.get('vehicleType') || '';

    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (search) {
      query = {
        ...query,
        $or: [
          { vehicleNumber: { $regex: search, $options: 'i' } },
          { licensePlate: { $regex: search, $options: 'i' } },
          { 'driver.firstName': { $regex: search, $options: 'i' } },
          { 'driver.lastName': { $regex: search, $options: 'i' } },
          { 'driver.email': { $regex: search, $options: 'i' } },
          { hospitalAffiliation: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (status) {
      query = { ...query, status };
    }

    if (vehicleType) {
      query = { ...query, vehicleType };
    }

    // Add approval filter if specified
    const approvalStatus = searchParams.get('approvalStatus');
    if (approvalStatus === 'pending') {
      query = { ...query, isApproved: false };
    } else if (approvalStatus === 'approved') {
      query = { ...query, isApproved: true };
    }

    const ambulances = await Ambulance.find(query)
      .select('-driver.password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Ambulance.countDocuments(query);

    return NextResponse.json({
      ambulances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Get ambulances error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ambulances', details: error.message },
      { status: 500 }
    );
  }
}

// POST new ambulance
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const ambulanceData = await request.json();

    const ambulance = new Ambulance(ambulanceData);
    const savedAmbulance = await ambulance.save();

    const ambulanceResponse = savedAmbulance.toObject();
    delete ambulanceResponse.driver.password;

    return NextResponse.json(
      { message: 'Ambulance created successfully', ambulance: ambulanceResponse },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create ambulance error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create ambulance', details: error.message },
      { status: 500 }
    );
  }
} 