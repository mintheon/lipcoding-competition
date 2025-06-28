const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

function getDatabase() {
  return new sqlite3.Database(DB_PATH);
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create users table
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT,
          role TEXT NOT NULL CHECK (role IN ('mentor', 'mentee')),
          bio TEXT,
          skills TEXT,
          image_data BLOB,
          image_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create match_requests table
      db.run(`
        CREATE TABLE IF NOT EXISTS match_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mentor_id INTEGER NOT NULL,
          mentee_id INTEGER NOT NULL,
          message TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (mentor_id) REFERENCES users (id),
          FOREIGN KEY (mentee_id) REFERENCES users (id),
          UNIQUE(mentor_id, mentee_id)
        )
      `);
      
      // Create indexes for better performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_match_requests_mentor ON match_requests(mentor_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_match_requests_mentee ON match_requests(mentee_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status)`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
    
    db.close();
  });
}

module.exports = {
  getDatabase,
  initDatabase
};
