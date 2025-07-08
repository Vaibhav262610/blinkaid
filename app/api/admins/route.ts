import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';

// GET all admins
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (search) {
      query = {
        ...query,
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (role) {
      query = { ...query, role };
    }

    const admins = await Admin.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Admin.countDocuments(query);

    return NextResponse.json({
      admins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins', details: error.message },
      { status: 500 }
    );
  }
}

// POST new admin
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const adminData = await request.json();

    const admin = new Admin(adminData);
    const savedAdmin = await admin.save();

    const { password, ...adminWithoutPassword } = savedAdmin.toObject();

    return NextResponse.json(
      { message: 'Admin created successfully', admin: adminWithoutPassword },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create admin error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create admin', details: error.message },
      { status: 500 }
    );
  }
} 