use anyhow::Result;
use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use chrono::{DateTime, Utc};

pub mod commands;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Session {
    pub id: String,
    pub title: String,
    pub description: String,
    pub order_index: i32,
    pub difficulty: String,
    pub estimated_duration: i32, // in minutes
    pub prerequisites: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProgress {
    pub session_id: String,
    pub status: SessionStatus,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub score: Option<i32>,
    pub attempts: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum SessionStatus {
    Locked,
    Available,
    InProgress,
    Completed,
}

pub struct EducationDB {
    conn: Connection,
}

impl EducationDB {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        
        // Create tables if they don't exist
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                order_index INTEGER NOT NULL,
                difficulty TEXT NOT NULL,
                estimated_duration INTEGER NOT NULL,
                prerequisites TEXT NOT NULL -- JSON array
            );
            
            CREATE TABLE IF NOT EXISTS user_progress (
                session_id TEXT PRIMARY KEY,
                status TEXT NOT NULL CHECK(status IN ('locked', 'available', 'in_progress', 'completed')),
                started_at TEXT,
                completed_at TEXT,
                score INTEGER,
                attempts INTEGER DEFAULT 0,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            );
            
            CREATE TABLE IF NOT EXISTS achievements (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                icon TEXT NOT NULL,
                unlocked_at TEXT
            );
            "
        )?;
        
        Ok(EducationDB { conn })
    }
    
    pub fn initialize_sessions(&self) -> Result<()> {
        let sessions = vec![
            Session {
                id: "01-single-agent-basics".to_string(),
                title: "Single Agent Basics".to_string(),
                description: "Master working with one agent".to_string(),
                order_index: 1,
                difficulty: "beginner".to_string(),
                estimated_duration: 30,
                prerequisites: vec![],
            },
            Session {
                id: "02-agent-configuration".to_string(),
                title: "Agent Configuration".to_string(),
                description: "Customize agent behavior".to_string(),
                order_index: 2,
                difficulty: "beginner".to_string(),
                estimated_duration: 45,
                prerequisites: vec!["01-single-agent-basics".to_string()],
            },
            Session {
                id: "03-basic-workflows".to_string(),
                title: "Basic Workflows".to_string(),
                description: "Create your first automated workflows".to_string(),
                order_index: 3,
                difficulty: "beginner".to_string(),
                estimated_duration: 60,
                prerequisites: vec!["02-agent-configuration".to_string()],
            },
            Session {
                id: "04-environment-setup".to_string(),
                title: "Environment Setup".to_string(),
                description: "Optimize your development environment".to_string(),
                order_index: 4,
                difficulty: "beginner".to_string(),
                estimated_duration: 45,
                prerequisites: vec!["03-basic-workflows".to_string()],
            },
            Session {
                id: "05-pair-programming".to_string(),
                title: "Pair Programming".to_string(),
                description: "Coordinate two agents effectively".to_string(),
                order_index: 5,
                difficulty: "intermediate".to_string(),
                estimated_duration: 60,
                prerequisites: vec!["04-environment-setup".to_string()],
            },
            Session {
                id: "06-handoff-patterns".to_string(),
                title: "Handoff Patterns".to_string(),
                description: "Master agent-to-agent handoffs".to_string(),
                order_index: 6,
                difficulty: "intermediate".to_string(),
                estimated_duration: 90,
                prerequisites: vec!["05-pair-programming".to_string()],
            },
            Session {
                id: "07-parallel-tasks".to_string(),
                title: "Parallel Tasks".to_string(),
                description: "Run multiple agents simultaneously".to_string(),
                order_index: 7,
                difficulty: "intermediate".to_string(),
                estimated_duration: 90,
                prerequisites: vec!["06-handoff-patterns".to_string()],
            },
            Session {
                id: "08-error-recovery".to_string(),
                title: "Error Recovery".to_string(),
                description: "Handle failures gracefully".to_string(),
                order_index: 8,
                difficulty: "intermediate".to_string(),
                estimated_duration: 60,
                prerequisites: vec!["07-parallel-tasks".to_string()],
            },
            Session {
                id: "09-multi-agent-projects".to_string(),
                title: "Multi-Agent Projects".to_string(),
                description: "Orchestrate 3+ agents".to_string(),
                order_index: 9,
                difficulty: "advanced".to_string(),
                estimated_duration: 120,
                prerequisites: vec!["08-error-recovery".to_string()],
            },
            Session {
                id: "10-complex-workflows".to_string(),
                title: "Complex Workflows".to_string(),
                description: "Build sophisticated pipelines".to_string(),
                order_index: 10,
                difficulty: "advanced".to_string(),
                estimated_duration: 120,
                prerequisites: vec!["09-multi-agent-projects".to_string()],
            },
            Session {
                id: "11-performance-optimization".to_string(),
                title: "Performance Optimization".to_string(),
                description: "Scale your workflows".to_string(),
                order_index: 11,
                difficulty: "advanced".to_string(),
                estimated_duration: 90,
                prerequisites: vec!["10-complex-workflows".to_string()],
            },
            Session {
                id: "12-production-patterns".to_string(),
                title: "Production Patterns".to_string(),
                description: "Deploy agent systems".to_string(),
                order_index: 12,
                difficulty: "advanced".to_string(),
                estimated_duration: 120,
                prerequisites: vec!["11-performance-optimization".to_string()],
            },
            Session {
                id: "13-custom-agent-creation".to_string(),
                title: "Custom Agent Creation".to_string(),
                description: "Build your own agents".to_string(),
                order_index: 13,
                difficulty: "expert".to_string(),
                estimated_duration: 180,
                prerequisites: vec!["12-production-patterns".to_string()],
            },
            Session {
                id: "14-advanced-orchestration".to_string(),
                title: "Advanced Orchestration".to_string(),
                description: "Enterprise-grade coordination".to_string(),
                order_index: 14,
                difficulty: "expert".to_string(),
                estimated_duration: 180,
                prerequisites: vec!["13-custom-agent-creation".to_string()],
            },
            Session {
                id: "15-system-integration".to_string(),
                title: "System Integration".to_string(),
                description: "Connect with external tools".to_string(),
                order_index: 15,
                difficulty: "expert".to_string(),
                estimated_duration: 150,
                prerequisites: vec!["14-advanced-orchestration".to_string()],
            },
            Session {
                id: "16-community-contribution".to_string(),
                title: "Community Contribution".to_string(),
                description: "Share your expertise".to_string(),
                order_index: 16,
                difficulty: "expert".to_string(),
                estimated_duration: 120,
                prerequisites: vec!["15-system-integration".to_string()],
            },
        ];
        
        for session in sessions {
            self.conn.execute(
                "INSERT OR REPLACE INTO sessions (id, title, description, order_index, difficulty, estimated_duration, prerequisites) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    session.id,
                    session.title,
                    session.description,
                    session.order_index,
                    session.difficulty,
                    session.estimated_duration,
                    serde_json::to_string(&session.prerequisites)?
                ],
            )?;
        }
        
        // Initialize first session as available
        self.conn.execute(
            "INSERT OR IGNORE INTO user_progress (session_id, status, attempts) VALUES (?1, ?2, 0)",
            params!["01-single-agent-basics", "available"],
        )?;
        
        Ok(())
    }
    
    pub fn get_all_sessions_with_progress(&self) -> Result<Vec<(Session, Option<UserProgress>)>> {
        let mut stmt = self.conn.prepare(
            "SELECT s.id, s.title, s.description, s.order_index, s.difficulty, s.estimated_duration, s.prerequisites,
                    p.status, p.started_at, p.completed_at, p.score, p.attempts
             FROM sessions s
             LEFT JOIN user_progress p ON s.id = p.session_id
             ORDER BY s.order_index"
        )?;
        
        let results = stmt.query_map([], |row| {
            let session = Session {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                order_index: row.get(3)?,
                difficulty: row.get(4)?,
                estimated_duration: row.get(5)?,
                prerequisites: serde_json::from_str(&row.get::<_, String>(6)?).unwrap_or_default(),
            };
            
            let progress = if let Ok(status_str) = row.get::<_, String>(7) {
                let status = match status_str.as_str() {
                    "locked" => SessionStatus::Locked,
                    "available" => SessionStatus::Available,
                    "in_progress" => SessionStatus::InProgress,
                    "completed" => SessionStatus::Completed,
                    _ => SessionStatus::Locked,
                };
                
                Some(UserProgress {
                    session_id: session.id.clone(),
                    status,
                    started_at: row.get::<_, Option<String>>(8).ok().flatten()
                        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
                        .map(|dt| dt.with_timezone(&Utc)),
                    completed_at: row.get::<_, Option<String>>(9).ok().flatten()
                        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
                        .map(|dt| dt.with_timezone(&Utc)),
                    score: row.get(10).ok(),
                    attempts: row.get(11).unwrap_or(0),
                })
            } else {
                None
            };
            
            Ok((session, progress))
        })?;
        
        let mut sessions_with_progress = Vec::new();
        for result in results {
            sessions_with_progress.push(result?);
        }
        
        Ok(sessions_with_progress)
    }
    
    pub fn start_session(&self, session_id: &str) -> Result<()> {
        let now = Utc::now().to_rfc3339();
        
        self.conn.execute(
            "INSERT OR REPLACE INTO user_progress (session_id, status, started_at, attempts) 
             VALUES (?1, 'in_progress', ?2, 
                     COALESCE((SELECT attempts + 1 FROM user_progress WHERE session_id = ?1), 1))",
            params![session_id, now],
        )?;
        
        Ok(())
    }
    
    pub fn complete_session(&self, session_id: &str, score: i32) -> Result<()> {
        let now = Utc::now().to_rfc3339();
        
        self.conn.execute(
            "UPDATE user_progress SET status = 'completed', completed_at = ?1, score = ?2 
             WHERE session_id = ?3",
            params![now, score, session_id],
        )?;
        
        // Unlock next session
        let next_session: Option<String> = self.conn.query_row(
            "SELECT id FROM sessions WHERE prerequisites LIKE ? ORDER BY order_index LIMIT 1",
            params![format!("%\"{}\"", session_id)],
            |row| row.get(0),
        ).ok();
        
        if let Some(next_id) = next_session {
            self.conn.execute(
                "INSERT OR IGNORE INTO user_progress (session_id, status, attempts) VALUES (?1, 'available', 0)",
                params![next_id],
            )?;
        }
        
        Ok(())
    }
    
    pub fn reset_progress(&self) -> Result<()> {
        self.conn.execute("DELETE FROM user_progress", [])?;
        
        // Make first session available
        self.conn.execute(
            "INSERT INTO user_progress (session_id, status, attempts) VALUES ('01-single-agent-basics', 'available', 0)",
            [],
        )?;
        
        Ok(())
    }
}