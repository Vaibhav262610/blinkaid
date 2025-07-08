import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, Admin, Ambulance } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password, userType } = await request.json();

    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, password, and user type are required' },
        { status: 400 }
      );
    }

    let user;
    let isPasswordValid = false;

    switch (userType) {
      case 'user':
        user = await User.findOne({ email, isActive: true });
        if (user) {
          isPasswordValid = await user.comparePassword(password);
        }
        break;

      case 'admin':
        user = await Admin.findOne({ email, isActive: true });
        if (user) {
          isPasswordValid = await user.comparePassword(password);
        }
        break;

      case 'driver':
        user = await Ambulance.findOne({ 'driver.email': email, isActive: true, isApproved: true });
        if (user) {
          isPasswordValid = await user.comparePassword(password);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid user type' },
          { status: 400 }
        );
    }

    if (!user || !isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login for admin
    if (userType === 'admin') {
      await Admin.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: userType === 'driver' ? user.driver.email : user.email,
        userType,
        role: userType === 'admin' ? user.role : undefined
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    if (userType === 'driver') {
      delete userResponse.driver.password;
    }

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userResponse,
      userType
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
} 