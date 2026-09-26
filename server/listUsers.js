require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find().select('_id name email role');

    console.log('\nUSERS:\n');

    users.forEach((user) => {
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('-------------------------');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listUsers();
