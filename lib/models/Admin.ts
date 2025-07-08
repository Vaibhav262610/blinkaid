import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  department: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema({
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
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_drivers',
      'manage_ambulances',
      'view_emergencies',
      'manage_system',
      'view_analytics',
      'manage_admins'
    ]
  }],
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
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
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create index for role
AdminSchema.index({ role: 1 });

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema); 