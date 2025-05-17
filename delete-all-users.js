const mongoose = require('mongoose');
const User = require('./src/models/User');
const config = require('./src/config/config');

mongoose.connect(config.MONGODB_URI)
  .then(async () => {
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users.`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  }); 