import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User, Admin, Ambulance, EmergencyRequest } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let data: any = {};

    switch (type) {
      case 'stats':
        const [users, admins, ambulances] = await Promise.all([
          User.countDocuments({ isActive: true }),
          Admin.countDocuments({ isActive: true }),
          Ambulance.countDocuments({ isActive: true })
        ]);

        const activeAmbulances = await Ambulance.countDocuments({ 
          isActive: true, 
          status: 'available',
          isApproved: true 
        });

        const pendingApprovals = await Ambulance.countDocuments({ 
          isActive: true, 
          isApproved: false 
        });

        data = {
          totalUsers: users,
          totalAdmins: admins,
          totalAmbulances: ambulances,
          activeAmbulances,
          pendingApprovals
        };
        break;

      case 'users':
        data.users = await User.find({ isActive: true })
          .select('-password')
          .sort({ createdAt: -1 })
          .limit(10);
        break;

      case 'ambulances':
        data.ambulances = await Ambulance.find({ isActive: true })
          .select('-driver.password')
          .sort({ createdAt: -1 })
          .limit(10);
        break;

      case 'pending':
        data.pendingAmbulances = await Ambulance.find({ 
          isActive: true, 
          isApproved: false 
        })
          .select('-driver.password')
          .sort({ createdAt: -1 });
        break;

      case 'emergency-requests':
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');
        const driverId = searchParams.get('driverId');
        
        let query: any = { isActive: true };
        if (status) query.status = status;
        if (userId) query.userId = userId;
        if (driverId) query.driverId = driverId;
        
        data.emergencyRequests = await EmergencyRequest.find(query)
          .populate('userId', 'firstName lastName email phone')
          .populate('driverId', 'vehicleNumber driver.firstName driver.lastName')
          .sort({ requestTime: -1 })
          .limit(10);
        break;

      default:
        // Return all data
        const [allUsers, allAdmins, allAmbulances, pendingCount, pendingRequests, activeRequests] = await Promise.all([
          User.countDocuments({ isActive: true }),
          Admin.countDocuments({ isActive: true }),
          Ambulance.countDocuments({ isActive: true }),
          Ambulance.countDocuments({ isActive: true, isApproved: false }),
          EmergencyRequest.countDocuments({ status: 'pending', isActive: true }),
          EmergencyRequest.countDocuments({ status: { $in: ['assigned', 'en_route'] }, isActive: true })
        ]);

        const activeAmbulancesCount = await Ambulance.countDocuments({ 
          isActive: true, 
          status: 'available',
          isApproved: true 
        });

        data = {
          stats: {
            totalUsers: allUsers,
            totalAdmins: allAdmins,
            totalAmbulances: allAmbulances,
            activeAmbulances: activeAmbulancesCount,
            pendingApprovals: pendingCount,
            pendingRequests,
            activeRequests
          },
          recentUsers: await User.find({ isActive: true })
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5),
          recentAmbulances: await Ambulance.find({ isActive: true })
            .select('-driver.password')
            .sort({ createdAt: -1 })
            .limit(5),
          pendingAmbulances: await Ambulance.find({ 
            isActive: true, 
            isApproved: false 
          })
            .select('-driver.password')
            .sort({ createdAt: -1 }),
          recentEmergencyRequests: await EmergencyRequest.find({ isActive: true })
            .populate('userId', 'firstName lastName email phone')
            .populate('driverId', 'vehicleNumber driver.firstName driver.lastName')
            .sort({ requestTime: -1 })
            .limit(5)
        };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      data
    });

  } catch (error: any) {
    console.error('Real-time data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time data', details: error.message },
      { status: 500 }
    );
  }
} 