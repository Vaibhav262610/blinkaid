import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const user = await User.findById(params.id).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const updateData = await request.json();

    // Remove password from update data if it's not being changed
    if (!updateData.password) {
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deactivated successfully',
      user
    });

  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
} 