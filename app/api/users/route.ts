import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// GET all users
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (search) {
      query = {
        ...query,
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

// POST new user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userData = await request.json();

    const user = new User(userData);
    const savedUser = await user.save();

    const { password, ...userWithoutPassword } = savedUser.toObject();

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Create user error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
} 