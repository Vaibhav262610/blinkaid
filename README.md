# Emergency Ambulance Network - Real-Time System

A comprehensive emergency ambulance management system with real-time updates and admin approval workflow.

## Features

### 🔄 Real-Time System
- **Live Dashboard Updates**: All dashboards refresh automatically every 30 seconds
- **Real-Time API**: `/api/realtime` endpoint provides live system statistics
- **Live Status Indicators**: Visual indicators show system status and last update times
- **Automatic Data Refresh**: No manual refresh needed for up-to-date information

### 👨‍💼 Admin Approval System
- **Driver Registration Approval**: Admins must approve new driver registrations
- **Pending Approvals Dashboard**: Dedicated tab to review and approve/reject drivers
- **Approval Status Tracking**: Drivers cannot login until approved by admin
- **Real-Time Approval Updates**: Instant feedback when approving/rejecting drivers

### 🏥 Multi-Role System
- **User Dashboard**: Emergency request history and profile management
- **Driver Dashboard**: Real-time trip management and status updates
- **Admin Dashboard**: Complete system oversight with approval controls

## Database Models

### User Model
- Personal information (name, email, phone, address)
- Medical information (blood type, allergies, emergency contacts)
- Account status and timestamps

### Admin Model
- Administrative credentials and permissions
- System access controls
- Account management capabilities

### Ambulance Model
- Vehicle information (number, type, capacity, license)
- Driver details with approval status
- Current location and operational status
- Hospital affiliations

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login with approval check

### Real-Time Data
- `GET /api/realtime` - Live system statistics and data
- `GET /api/realtime?type=stats` - System statistics only
- `GET /api/realtime?type=users` - Recent users
- `GET /api/realtime?type=ambulances` - Recent ambulances
- `GET /api/realtime?type=pending` - Pending approvals

### User Management
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Ambulance Management
- `GET /api/ambulances` - List all ambulances
- `POST /api/ambulances` - Register new ambulance
- `PUT /api/ambulances/[id]` - Update ambulance
- `DELETE /api/ambulances/[id]` - Delete ambulance
- `POST /api/ambulances/[id]/approve` - Approve/reject driver

### Admin Management
- `GET /api/admins` - List all admins
- `POST /api/admins` - Create new admin
- `PUT /api/admins/[id]` - Update admin
- `DELETE /api/admins/[id]` - Delete admin

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/blinkAid
JWT_SECRET=your-secret-key-here
```