import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, Admin, Ambulance } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userType, ...userData } = body;

    let result;

    switch (userType) {
      case 'user':
        // Create user with only required fields and safe defaults
        const userDataToSave: any = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          emergencyContact: {
            name: userData.emergencyContact || 'Emergency Contact',
            phone: userData.emergencyContactPhone || userData.phone || '',
            relationship: userData.emergencyContactRelationship || 'Family'
          },
          address: {
            street: userData.street || '',
            city: userData.city || '',
            state: userData.state || '',
            zipCode: userData.zipCode || ''
          }
        };
        
        // Only add dateOfBirth if it exists
        if (userData.dateOfBirth) {
          userDataToSave.dateOfBirth = new Date(userData.dateOfBirth);
        }
        
        const user = new User(userDataToSave);
        result = await user.save();
        break;

      case 'admin':
        // Create admin
        const admin = new Admin({
          ...userData,
          permissions: userData.permissions || ['manage_users', 'view_emergencies']
        });
        result = await admin.save();
        break;

      case 'driver':
        // Create ambulance with driver - only required fields
        const ambulanceData: any = {
          vehicleNumber: userData.vehicleNumber,
          licensePlate: userData.licensePlate,
          vehicleType: userData.vehicleType || 'basic',
          capacity: userData.capacity || 2,
          equipment: userData.equipment || [],
          driver: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            licenseNumber: userData.licenseNumber,
            licenseExpiry: new Date(userData.licenseExpiry),
            experience: userData.experience || 0,
            certifications: userData.certifications || []
          },
          hospitalAffiliation: userData.hospitalAffiliation || 'General Hospital'
        };
        
        // Only add currentLocation if coordinates are provided
        if (userData.latitude !== undefined && userData.longitude !== undefined) {
          ambulanceData.currentLocation = {
            latitude: userData.latitude,
            longitude: userData.longitude,
            address: userData.address || ''
          };
        }
        
        const ambulance = new Ambulance(ambulanceData);
        result = await ambulance.save();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid user type' },
          { status: 400 }
        );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = result.toObject();

    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
} 