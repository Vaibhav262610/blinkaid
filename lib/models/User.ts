import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  emergencyContact: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  dateOfBirth?: Date;
  bloodType?: string;
  medicalConditions?: string[];
  allergies?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  emergencyContact: {
    name: {
      type: String,
      required: false,
      default: 'Emergency Contact'
    },
    phone: {
      type: String,
      required: false,
      default: ''
    },
    relationship: {
      type: String,
      required: false,
      default: 'Family'
    }
  },
  address: {
    street: {
      type: String,
      required: false,
      default: ''
    },
    city: {
      type: String,
      required: false,
      default: ''
    },
    state: {
      type: String,
      required: false,
      default: ''
    },
    zipCode: {
      type: String,
      required: false,
      default: ''
    }
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  medicalConditions: [{
    type: String,
    trim: true
  }],
  allergies: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Additional indexes can be added here if needed

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 