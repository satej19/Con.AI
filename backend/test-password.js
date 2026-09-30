const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/material_mgmt');
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isActive: Boolean
    }));
    
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    users.forEach(u => console.log(`- ${u.email}`));
    
    const user = await User.findOne({ email: 'admin@example.com' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password);
    
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('Password comparison result:', isValid);
    
    // Test with fresh hash
    const freshHash = await bcrypt.hash(testPassword, 12);
    console.log('Fresh hash:', freshHash);
    const freshCheck = await bcrypt.compare(testPassword, freshHash);
    console.log('Fresh hash comparison:', freshCheck);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();
