// ============================================================
// Utility: Seed a default admin account if none exists yet
// Runs automatically on every server startup - safe to run
// repeatedly, since it does nothing once an admin already exists.
// ============================================================
const bcrypt = require('bcrypt');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return; // an admin already exists, nothing to do
    }

    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@taskflow.com';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await User.create({
      name: 'System Admin',
      email: defaultEmail,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ No admin found - created default admin account:');
    console.log(`   email: ${defaultEmail}`);
    console.log(`   password: ${defaultPassword}`);
    console.log('   (log in and change this password, or create other admins from the Users page)');
  } catch (err) {
    console.error('❌ Failed to seed default admin:', err.message);
  }
};

module.exports = seedAdmin;