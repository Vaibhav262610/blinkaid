import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyRequest extends Document {
  requestId: string;
  userId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  emergencyType: 'cardiac' | 'accident' | 'breathing' | 'stroke' | 'trauma' | 'overdose' | 'allergic' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
  
  // Location details
  pickupLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  destinationLocation?: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Patient details
  patientDetails: {
    name: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    phone?: string;
    bloodType?: string;
    allergies?: string[];
    medicalConditions?: string[];
  };
  
  // Emergency details
  description: string;
  symptoms?: string[];
  
  // Timing
  requestTime: Date;
  assignedTime?: Date;
  estimatedArrival?: Date;
  arrivalTime?: Date;
  completionTime?: Date;
  
  // Driver response
  responseTime?: number; // in minutes
  driverNotes?: string;
  
  // System fields
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyRequestSchema = new Schema<IEmergencyRequest>({
  requestId: {
    type: String,
    required: true,
    unique: true,
    default: () => `ER-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'Ambulance'
  },
  emergencyType: {
    type: String,
    enum: ['cardiac', 'accident', 'breathing', 'stroke', 'trauma', 'overdose', 'allergic', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'en_route', 'arrived', 'completed', 'cancelled'],
    required: true,
    default: 'pending'
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  destinationLocation: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  patientDetails: {
    name: {
      type: String,
      required: true
    },
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    phone: {
      type: String,
      required: false,
      default: 'Emergency - No phone provided'
    },
    bloodType: String,
    allergies: [String],
    medicalConditions: [String]
  },
  description: {
    type: String,
    required: true
  },
  symptoms: [String],
  requestTime: {
    type: Date,
    default: Date.now
  },
  assignedTime: Date,
  estimatedArrival: Date,
  arrivalTime: Date,
  completionTime: Date,
  responseTime: Number,
  driverNotes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
emergencyRequestSchema.index({ status: 1, isActive: 1 });
emergencyRequestSchema.index({ userId: 1, createdAt: -1 });
emergencyRequestSchema.index({ driverId: 1, status: 1 });
emergencyRequestSchema.index({ requestTime: -1 });

export default mongoose.models.EmergencyRequest || mongoose.model<IEmergencyRequest>('EmergencyRequest', emergencyRequestSchema); 