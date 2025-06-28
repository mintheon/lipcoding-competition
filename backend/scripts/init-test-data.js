const bcrypt = require('bcryptjs');
const { getDatabase, initDatabase } = require('../middleware/database');

async function initTestData() {
  console.log('🎯 Initializing test data...');
  
  // Initialize database tables first
  await initDatabase();
  
  const db = getDatabase();
  
  try {
    // Hash passwords
    const mentorPassword = await bcrypt.hash('password123', 12);
    const menteePassword = await bcrypt.hash('password123', 12);
    
    // Helper function to run SQL as Promise
    const runSQL = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    };
    
    // Insert test mentor
    await runSQL(`
      INSERT OR REPLACE INTO users (id, email, password, name, role, bio, skills, created_at, updated_at)
      VALUES (1, 'mentor@test.com', ?, 'John Mentor', 'mentor', 
              'Experienced full-stack developer with 10+ years of experience', 
              '["React", "Node.js", "Python", "JavaScript", "TypeScript"]',
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [mentorPassword]);
    
    // Insert test mentee
    await runSQL(`
      INSERT OR REPLACE INTO users (id, email, password, name, role, bio, created_at, updated_at)
      VALUES (2, 'mentee@test.com', ?, 'Jane Mentee', 'mentee',
              'Aspiring developer looking to learn modern web technologies',
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [menteePassword]);
    
    // Insert additional test mentors
    const mentors = [
      {
        email: 'alice@mentor.com',
        name: 'Alice Frontend',
        bio: 'Frontend specialist with expertise in React and Vue.js',
        skills: '["React", "Vue.js", "CSS", "HTML", "JavaScript"]'
      },
      {
        email: 'bob@mentor.com', 
        name: 'Bob Backend',
        bio: 'Backend engineer specializing in Python and databases',
        skills: '["Python", "Django", "PostgreSQL", "Docker", "AWS"]'
      },
      {
        email: 'charlie@mentor.com',
        name: 'Charlie DevOps',
        bio: 'DevOps engineer with cloud and containerization expertise',
        skills: '["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform"]'
      }
    ];
    
    for (let i = 0; i < mentors.length; i++) {
      const mentor = mentors[i];
      await runSQL(`
        INSERT OR REPLACE INTO users (id, email, password, name, role, bio, skills, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'mentor', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [i + 3, mentor.email, mentorPassword, mentor.name, mentor.bio, mentor.skills]);
    }
    
    // Insert additional test mentees
    const mentees = [
      {
        email: 'student1@mentee.com',
        name: 'Sarah Student',
        bio: 'Computer science student interested in web development'
      },
      {
        email: 'junior@mentee.com',
        name: 'Mike Junior',
        bio: 'Junior developer looking to advance my skills'
      }
    ];
    
    for (let i = 0; i < mentees.length; i++) {
      const mentee = mentees[i];
      await runSQL(`
        INSERT OR REPLACE INTO users (id, email, password, name, role, bio, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'mentee', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [i + 6, mentee.email, menteePassword, mentee.name, mentee.bio]);
    }
    
    console.log('✅ Test data initialized successfully!');
    console.log('');
    console.log('📋 Test Accounts:');
    console.log('');
    console.log('🧑‍🏫 Mentors:');
    console.log('  • mentor@test.com / password123');
    console.log('  • alice@mentor.com / password123');
    console.log('  • bob@mentor.com / password123');
    console.log('  • charlie@mentor.com / password123');
    console.log('');
    console.log('🧑‍🎓 Mentees:');
    console.log('  • mentee@test.com / password123');
    console.log('  • student1@mentee.com / password123');
    console.log('  • junior@mentee.com / password123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error initializing test data:', error);
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  initTestData().catch(console.error);
}

module.exports = { initTestData };
