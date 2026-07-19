const mongoose = require('mongoose');
const dns = require('dns');

// Use Google/Cloudflare public DNS to bypass Windows/router DNS blocking SRV lookup for mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
}

const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI;

    if (!connString) {
      console.error('❌ Error: MONGO_URI environment variable is not defined in .env file.');
      process.exit(1);
    }

    const conn = await mongoose.connect(connString);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
