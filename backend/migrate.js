const db = require('./db');

const migrate = async () => {
  try {
    console.log('Starting database migrations...');

    // 1. Check if columns exist in users table
    const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'is_premium'");
    if (columns.length === 0) {
      console.log("Adding 'is_premium' and 'premium_until' columns to 'users' table...");
      await db.query(`
        ALTER TABLE users
        ADD COLUMN is_premium BOOLEAN DEFAULT FALSE,
        ADD COLUMN premium_until DATETIME DEFAULT NULL
      `);
      console.log("Columns added successfully.");
    } else {
      console.log("'is_premium' column already exists in 'users' table.");
    }

    // 2. Create premium_requests table
    console.log("Creating 'premium_requests' table if not exists...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS premium_requests (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        freelancer_id INT NOT NULL,
        status        ENUM('pending','approved','rejected') DEFAULT 'pending',
        bukti_bayar   VARCHAR(255) DEFAULT NULL,
        paket         ENUM('monthly','yearly') NOT NULL,
        harga         DECIMAL(12,2) NOT NULL,
        catatan_admin TEXT DEFAULT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("'premium_requests' table verified/created.");

    // 3. Create portofolio table
    console.log("Creating 'portofolio' table if not exists...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS portofolio (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        freelancer_id INT NOT NULL,
        judul         VARCHAR(200) NOT NULL,
        deskripsi     TEXT DEFAULT NULL,
        link_url      VARCHAR(500) DEFAULT NULL,
        gambar        VARCHAR(255) DEFAULT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("'portofolio' table verified/created.");

    console.log('Database migrations completed successfully!');
  } catch (err) {
    console.error('Database migration failed:', err);
    throw err;
  }
};

module.exports = migrate;

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
