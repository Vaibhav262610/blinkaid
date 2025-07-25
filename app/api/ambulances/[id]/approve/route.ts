import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Ambulance } from '@/lib/models';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { approved } = await request.json();

    const ambulance = await Ambulance.findByIdAndUpdate(
      id,
      { isApproved: approved },
      { new: true }
    ).select('-driver.password');

    if (!ambulance) {
      return NextResponse.json(
        { error: 'Ambulance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Ambulance ${approved ? 'approved' : 'rejected'} successfully`,
      ambulance
    });

  } catch (error: any) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Failed to update approval status', details: error.message },
      { status: 500 }
    );
  }
} 