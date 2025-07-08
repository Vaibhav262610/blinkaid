import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { EmergencyRequest } from '@/lib/models';

export async function GET() {
  try {
    console.log('Testing EmergencyRequest model...');
    await dbConnect();
    console.log('Database connected');
    
    // Test creating a simple emergency request
    const testRequest = new EmergencyRequest({
      requestId: `TEST-${Date.now()}`,
      emergencyType: 'other',
      priority: 'high',
      pickupLocation: {
        address: 'Test Location'
      },
      patientDetails: {
        name: 'Test Patient'
      },
      description: 'Test emergency request'
    });
    
    console.log('Test request object created');
    await testRequest.save();
    console.log('Test request saved successfully');
    
    // Clean up
    await EmergencyRequest.findByIdAndDelete(testRequest._id);
    console.log('Test request cleaned up');
    
    return NextResponse.json({ 
      message: 'EmergencyRequest model is working correctly',
      testId: testRequest._id 
    });
    
  } catch (error: any) {
    console.error('Test failed:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
} 