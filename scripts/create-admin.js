const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emergency-ambulance-network', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Admin Schema (simplified for script)
const adminSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@blinkaid.com' });
    
    if (existingAdmin) {
      console.log('Default admin already exists!');
      console.log('Email: admin@blinkaid.com');
      console.log('Password: admin123456');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123456', 12);

    // Create admin
    const admin = new Admin({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@blinkaid.com',
      password: hashedPassword,
      phone: '+1234567890',
      role: 'admin',
      isActive: true
    });

    await admin.save();
    
    console.log('Default admin created successfully!');
    console.log('Email: admin@blinkaid.com');
    console.log('Password: admin123456');
    console.log('Please change the password after first login.');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createDefaultAdmin(); 