require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findById(
      '6ab0f11b1483cb2f532e2387'
    );

    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    user.password = 'Kaka@12345';

    await user.save();

    console.log('Password reset successfully');
    console.log('Email:', user.email);
    console.log('New password: Kaka@12345');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Password reset error:', error.message);
    process.exit(1);
  }
};

resetPassword();