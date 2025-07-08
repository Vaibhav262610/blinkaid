import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Test creating a minimal user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'password123'
    });
    
    const savedUser = await testUser.save();
    const { password, ...userWithoutPassword } = savedUser.toObject();
    
    // Clean up - delete the test user
    await User.findByIdAndDelete(savedUser._id);
    
    return NextResponse.json({
      message: 'User model is working correctly',
      testUser: userWithoutPassword
    });
    
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error.message,
      validationErrors: error.errors
    }, { status: 500 });
  }
} 