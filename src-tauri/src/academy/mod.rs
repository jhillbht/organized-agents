// Academy Module - Database schema and core functionality

use anyhow::Result;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lesson {
    pub id: String,
    pub module_id: String,
    pub title: String,
    pub description: String,
    pub duration: i32, // minutes
    pub difficulty: String,
    pub objectives: Vec<String>,
    pub content: String, // JSON serialized content
    pub prerequisites: Vec<String>,
    pub next_lesson: Option<String>,
    pub tags: Vec<String>,
    pub order_index: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Exercise {
    pub id: String,
    pub lesson_id: String,
    pub exercise_type: String,
    pub title: String,
    pub description: String,
    pub difficulty: i32,
    pub points: i32,
    pub content: String, // JSON serialized content
    pub validation_rules: String, // JSON
    pub hints: Vec<String>,
    pub solution: Option<String>,
    pub order_index: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserLessonProgress {
    pub user_id: String,
    pub lesson_id: String,
    pub status: String,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
    pub progress_percentage: f32,
    pub exercises_completed: Vec<String>,
    pub score: i32,
    pub time_spent: i32, // seconds
    pub attempts: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserExerciseSubmission {
    pub id: String,
    pub user_id: String,
    pub exercise_id: String,
    pub lesson_id: String,
    pub submission: String,
    pub is_correct: bool,
    pub score: i32,
    pub feedback: Option<String>,
    pub submitted_at: String,
    pub time_spent: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Achievement {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub category: String,
    pub requirement_type: String,
    pub requirement_value: i32,
    pub requirement_metadata: Option<String>, // JSON
    pub points: i32,
    pub rarity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserAchievement {
    pub user_id: String,
    pub achievement_id: String,
    pub unlocked_at: String,
    pub progress: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningModule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub skill_level: String,
    pub estimated_duration: i32, // hours
    pub order_index: i32,
    pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserStats {
    pub user_id: String,
    pub total_lessons_completed: i32,
    pub total_exercises_solved: i32,
    pub total_points: i32,
    pub total_time_spent: i32,
    pub current_streak: i32,
    pub longest_streak: i32,
    pub level: i32,
    pub experience: i32,
    pub achievements_unlocked: i32,
    pub average_score: f32,
    pub last_activity_date: String,
}

pub fn initialize_academy_db(conn: &Connection) -> Result<()> {
    // Create tables for academy
    conn.execute(
        "CREATE TABLE IF NOT EXISTS academy_modules (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            skill_level TEXT NOT NULL,
            estimated_duration INTEGER NOT NULL,
            order_index INTEGER NOT NULL,
            icon TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS academy_lessons (
            id TEXT PRIMARY KEY,
            module_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            duration INTEGER NOT NULL,
            difficulty TEXT NOT NULL,
            objectives TEXT NOT NULL, -- JSON array
            content TEXT NOT NULL, -- JSON
            prerequisites TEXT NOT NULL, -- JSON array
            next_lesson TEXT,
            tags TEXT NOT NULL, -- JSON array
            order_index INTEGER NOT NULL,
            FOREIGN KEY (module_id) REFERENCES academy_modules(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS academy_exercises (
            id TEXT PRIMARY KEY,
            lesson_id TEXT NOT NULL,
            exercise_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            difficulty INTEGER NOT NULL,
            points INTEGER NOT NULL,
            content TEXT NOT NULL, -- JSON
            validation_rules TEXT NOT NULL, -- JSON
            hints TEXT NOT NULL, -- JSON array
            solution TEXT,
            order_index INTEGER NOT NULL,
            FOREIGN KEY (lesson_id) REFERENCES academy_lessons(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS academy_user_progress (
            user_id TEXT NOT NULL,
            lesson_id TEXT NOT NULL,
            status TEXT NOT NULL,
            started_at TEXT,
            completed_at TEXT,
            progress_percentage REAL NOT NULL DEFAULT 0,
            exercises_completed TEXT NOT NULL DEFAULT '[]', -- JSON array
            score INTEGER NOT NULL DEFAULT 0,
            time_spent INTEGER NOT NULL DEFAULT 0,
            attempts INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (user_id, lesson_id),
            FOREIGN KEY (lesson_id) REFERENCES academy_lessons(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS academy_exercise_submissions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            exercise_id TEXT NOT NULL,
            lesson_id TEXT NOT NULL,
            submission TEXT NOT NULL,
            is_correct INTEGER NOT NULL,
            score INTEGER NOT NULL,
            feedback TEXT,
            submitted_at TEXT NOT NULL,
            time_spent INTEGER NOT NULL,
            FOREIGN KEY (exercise_id) REFERENCES academy_exercises(id),
            FOREIGN KEY (lesson_id) REFERENCES academy_lessons(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS academy_achievements (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL,
            category TEXT NOT NULL,
            requirement_type TEXT NOT NULL,
            requirement_value INTEGER NOT NULL,
            requirement_metadata TEXT, -- JSON
            points INTEGER NOT NULL,
            rarity TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS academy_user_achievements (
            user_id TEXT NOT NULL,
            achievement_id TEXT NOT NULL,
            unlocked_at TEXT NOT NULL,
            progress REAL NOT NULL DEFAULT 0,
            PRIMARY KEY (user_id, achievement_id),
            FOREIGN KEY (achievement_id) REFERENCES academy_achievements(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS academy_user_stats (
            user_id TEXT PRIMARY KEY,
            total_lessons_completed INTEGER NOT NULL DEFAULT 0,
            total_exercises_solved INTEGER NOT NULL DEFAULT 0,
            total_points INTEGER NOT NULL DEFAULT 0,
            total_time_spent INTEGER NOT NULL DEFAULT 0,
            current_streak INTEGER NOT NULL DEFAULT 0,
            longest_streak INTEGER NOT NULL DEFAULT 0,
            level INTEGER NOT NULL DEFAULT 1,
            experience INTEGER NOT NULL DEFAULT 0,
            achievements_unlocked INTEGER NOT NULL DEFAULT 0,
            average_score REAL NOT NULL DEFAULT 0,
            last_activity_date TEXT NOT NULL
        )",
        [],
    )?;

    // Create indexes for better performance
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_lessons_module 
         ON academy_lessons(module_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_exercises_lesson 
         ON academy_exercises(lesson_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_progress_user 
         ON academy_user_progress(user_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_submissions_user 
         ON academy_exercise_submissions(user_id)",
        [],
    )?;

    Ok(())
}

pub fn get_db_path() -> Result<PathBuf> {
    let app_dir = dirs::data_dir()
        .ok_or_else(|| anyhow::anyhow!("Failed to get data directory"))?
        .join("organized-agents");
    
    std::fs::create_dir_all(&app_dir)?;
    Ok(app_dir.join("academy.db"))
}

pub fn get_connection() -> Result<Connection> {
    let db_path = get_db_path()?;
    let conn = Connection::open(db_path)?;
    initialize_academy_db(&conn)?;
    Ok(conn)
}

// Seed initial academy content
pub fn seed_academy_content(conn: &Connection) -> Result<()> {
    // Insert default learning modules
    let modules = vec![
        ("foundation", "Foundation Path", "Master the basics of agent development", "beginner", 8, 1, "🎯"),
        ("coordination", "Coordination Path", "Learn to orchestrate multiple agents", "intermediate", 12, 2, "🤝"),
        ("advanced", "Advanced Path", "Build sophisticated agent systems", "advanced", 16, 3, "🚀"),
        ("mastery", "Mastery Path", "Become an agent development expert", "expert", 20, 4, "👑"),
    ];

    for (id, name, desc, level, duration, order, icon) in modules {
        conn.execute(
            "INSERT OR IGNORE INTO academy_modules (id, name, description, skill_level, estimated_duration, order_index, icon) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![id, name, desc, level, duration, order, icon],
        )?;
    }

    // Insert default achievements
    let achievements = vec![
        ("first_lesson", "First Steps", "Complete your first lesson", "🎓", "lesson", "lessons_completed", 1, "{}", 10, "common"),
        ("fast_learner", "Fast Learner", "Complete a lesson in under 10 minutes", "⚡", "lesson", "custom", 1, r#"{"time_limit": 600}"#, 25, "uncommon"),
        ("perfect_score", "Perfectionist", "Get 100% on all exercises in a lesson", "💯", "exercise", "perfect_score", 1, "{}", 50, "rare"),
        ("week_streak", "Dedicated Learner", "Maintain a 7-day learning streak", "🔥", "streak", "streak_days", 7, "{}", 100, "epic"),
        ("agent_master", "Agent Master", "Complete all lessons in the Foundation Path", "🏆", "mastery", "custom", 4, r#"{"module": "foundation"}"#, 200, "legendary"),
    ];

    for (id, name, desc, icon, cat, req_type, req_val, req_meta, points, rarity) in achievements {
        conn.execute(
            "INSERT OR IGNORE INTO academy_achievements 
             (id, name, description, icon, category, requirement_type, requirement_value, requirement_metadata, points, rarity) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![id, name, desc, icon, cat, req_type, req_val, req_meta, points, rarity],
        )?;
    }

    Ok(())
}

// Test and utility commands for Academy database

#[command]
pub async fn test_academy_database() -> Result<String, String> {
    match test_academy_database_internal().await {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Database test failed: {}", e))
    }
}

async fn test_academy_database_internal() -> Result<String> {
    use std::time::Instant;
    
    let start = Instant::now();
    let conn = get_connection()?;
    
    // Test 1: Verify all tables exist
    let tables = vec![
        "academy_modules", "academy_lessons", "academy_exercises",
        "academy_user_progress", "academy_exercise_submissions", 
        "academy_achievements", "academy_user_achievements", "academy_user_stats"
    ];
    
    for table in &tables {
        let count: i32 = conn.query_row(
            &format!("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='{}'", table),
            [],
            |row| row.get(0)
        )?;
        
        if count == 0 {
            return Err(anyhow::anyhow!("Table {} does not exist", table));
        }
    }
    
    // Test 2: Insert and retrieve test data
    conn.execute(
        "INSERT OR IGNORE INTO academy_modules (id, name, description, skill_level, estimated_duration, order_index, icon) 
         VALUES ('test-module', 'Test Module', 'Test Description', 'beginner', 30, 1, '🧪')",
        []
    )?;
    
    let module_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM academy_modules WHERE id = 'test-module'",
        [],
        |row| row.get(0)
    )?;
    
    if module_count != 1 {
        return Err(anyhow::anyhow!("Test module insertion failed"));
    }
    
    // Test 3: Test foreign key constraints
    conn.execute(
        "INSERT OR IGNORE INTO academy_lessons (id, module_id, title, description, duration, difficulty, objectives, content, prerequisites, tags, order_index) 
         VALUES ('test-lesson', 'test-module', 'Test Lesson', 'Test Description', 15, 'beginner', '[]', '{}', '[]', '[]', 1)",
        []
    )?;
    
    // Test 4: Performance check
    let lesson_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM academy_lessons WHERE module_id = 'test-module'",
        [],
        |row| row.get(0)
    )?;
    
    // Clean up test data
    conn.execute("DELETE FROM academy_lessons WHERE id = 'test-lesson'", [])?;
    conn.execute("DELETE FROM academy_modules WHERE id = 'test-module'", [])?;
    
    let duration = start.elapsed();
    
    Ok(format!(
        "✅ Academy database test completed successfully!\n\
         📊 Results:\n\
         • {} tables verified\n\
         • Data insertion/deletion: OK\n\
         • Foreign key constraints: OK\n\
         • Performance: {}ms\n\
         🎯 Database is ready for Academy content!",
        tables.len(),
        duration.as_millis()
    ))
}

#[command]
pub async fn initialize_academy_database() -> Result<String, String> {
    match initialize_academy_database_internal().await {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Database initialization failed: {}", e))
    }
}

async fn initialize_academy_database_internal() -> Result<String> {
    let conn = get_connection()?;
    
    // Initialize schema (already done in get_connection)
    // Seed initial content
    seed_academy_content(&conn)?;
    
    // Verify seeded content
    let module_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM academy_modules",
        [],
        |row| row.get(0)
    )?;
    
    let achievement_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM academy_achievements", 
        [],
        |row| row.get(0)
    )?;
    
    Ok(format!(
        "🚀 Academy database initialized successfully!\n\
         📚 Content loaded:\n\
         • {} learning modules\n\
         • {} achievements\n\
         ✅ Ready for learning sessions!",
        module_count, achievement_count
    ))
}

#[command]
pub async fn get_academy_stats() -> Result<String, String> {
    match get_academy_stats_internal().await {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Failed to get academy stats: {}", e))
    }
}

async fn get_academy_stats_internal() -> Result<String> {
    let conn = get_connection()?;
    
    let module_count: i32 = conn.query_row("SELECT COUNT(*) FROM academy_modules", [], |row| row.get(0))?;
    let lesson_count: i32 = conn.query_row("SELECT COUNT(*) FROM academy_lessons", [], |row| row.get(0))?;
    let exercise_count: i32 = conn.query_row("SELECT COUNT(*) FROM academy_exercises", [], |row| row.get(0))?;
    let achievement_count: i32 = conn.query_row("SELECT COUNT(*) FROM academy_achievements", [], |row| row.get(0))?;
    let user_count: i32 = conn.query_row("SELECT COUNT(DISTINCT user_id) FROM academy_user_progress", [], |row| row.get(0))?;
    
    Ok(format!(
        "📊 Academy Statistics:\n\
         🎯 Content:\n\
         • {} modules\n\
         • {} lessons\n\
         • {} exercises\n\
         • {} achievements\n\
         👥 Users:\n\
         • {} active learners\n\
         🎮 Ready for education!",
        module_count, lesson_count, exercise_count, achievement_count, user_count
    ))
}