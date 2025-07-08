import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAmbulance extends Document {
  vehicleNumber: string;
  licensePlate: string;
  vehicleType: 'basic' | 'advanced' | 'critical_care';
  capacity: number;
  equipment: string[];
  driver: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    licenseNumber: string;
    licenseExpiry: Date;
    experience: number;
    certifications: string[];
  };
  hospitalAffiliation: string;
  currentLocation: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  isApproved: boolean;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AmbulanceSchema: Schema = new Schema({
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true,
    trim: true,
    index: true
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['basic', 'advanced', 'critical_care'],
    default: 'basic'
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot exceed 10']
  },
  equipment: [{
    type: String,
    trim: true
  }],
  driver: {
    firstName: {
      type: String,
      required: [true, 'Driver first name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Driver last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Driver email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Driver phone is required'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Driver password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    licenseNumber: {
      type: String,
      required: [true, 'Driver license number is required'],
      unique: true,
      trim: true,
      index: true
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required']
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative']
    },
    certifications: [{
      type: String,
      trim: true
    }]
  },
  hospitalAffiliation: {
    type: String,
    required: [true, 'Hospital affiliation is required'],
    trim: true
  },
  currentLocation: {
    latitude: {
      type: Number,
      required: false,
      default: 0,
      min: [-90, 'Invalid latitude'],
      max: [90, 'Invalid latitude']
    },
    longitude: {
      type: Number,
      required: false,
      default: 0,
      min: [-180, 'Invalid longitude'],
      max: [180, 'Invalid longitude']
    },
    address: {
      type: String,
      required: false,
      default: '',
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'maintenance', 'offline'],
    default: 'available'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
AmbulanceSchema.pre('save', async function(next) {
  if (!this.isModified('driver.password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.driver.password = await bcrypt.hash(this.driver.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
AmbulanceSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.driver.password);
};

// Create indexes
AmbulanceSchema.index({ status: 1 });
AmbulanceSchema.index({ currentLocation: '2dsphere' });

export default mongoose.models.Ambulance || mongoose.model<IAmbulance>('Ambulance', AmbulanceSchema); 