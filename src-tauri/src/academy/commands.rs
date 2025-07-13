use super::*;
use serde_json::{json, Value};
use rusqlite::params;
use serde::{Serialize, Deserialize};

#[tauri::command]
pub async fn get_academy_modules() -> Result<Vec<LearningModule>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, description, skill_level, estimated_duration, order_index, icon 
         FROM academy_modules 
         ORDER BY order_index"
    ).map_err(|e| e.to_string())?;
    
    let modules = stmt.query_map([], |row| {
        Ok(LearningModule {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            skill_level: row.get(3)?,
            estimated_duration: row.get(4)?,
            order_index: row.get(5)?,
            icon: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(modules)
}

#[tauri::command]
pub async fn get_academy_lessons(module_id: Option<String>) -> Result<Vec<Lesson>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    
    let query = if let Some(mod_id) = module_id {
        format!(
            "SELECT id, module_id, title, description, duration, difficulty, objectives, 
             content, prerequisites, next_lesson, tags, order_index 
             FROM academy_lessons 
             WHERE module_id = '{}' 
             ORDER BY order_index", 
            mod_id
        )
    } else {
        "SELECT id, module_id, title, description, duration, difficulty, objectives, 
         content, prerequisites, next_lesson, tags, order_index 
         FROM academy_lessons 
         ORDER BY module_id, order_index".to_string()
    };
    
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    
    let lessons = stmt.query_map([], |row| {
        let objectives: String = row.get(6)?;
        let prerequisites: String = row.get(8)?;
        let tags: String = row.get(10)?;
        
        Ok(Lesson {
            id: row.get(0)?,
            module_id: row.get(1)?,
            title: row.get(2)?,
            description: row.get(3)?,
            duration: row.get(4)?,
            difficulty: row.get(5)?,
            objectives: serde_json::from_str(&objectives).unwrap_or_default(),
            content: row.get(7)?,
            prerequisites: serde_json::from_str(&prerequisites).unwrap_or_default(),
            next_lesson: row.get(9)?,
            tags: serde_json::from_str(&tags).unwrap_or_default(),
            order_index: row.get(11)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(lessons)
}

#[tauri::command]
pub async fn get_lesson_with_progress(lesson_id: String, user_id: String) -> Result<Value, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    
    // Get lesson details
    let lesson = conn.query_row(
        "SELECT id, module_id, title, description, duration, difficulty, objectives, 
         content, prerequisites, next_lesson, tags, order_index 
         FROM academy_lessons 
         WHERE id = ?1",
        params![lesson_id],
        |row| {
            let objectives: String = row.get(6)?;
            let prerequisites: String = row.get(8)?;
            let tags: String = row.get(10)?;
            
            Ok(Lesson {
                id: row.get(0)?,
                module_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                duration: row.get(4)?,
                difficulty: row.get(5)?,
                objectives: serde_json::from_str(&objectives).unwrap_or_default(),
                content: row.get(7)?,
                prerequisites: serde_json::from_str(&prerequisites).unwrap_or_default(),
                next_lesson: row.get(9)?,
                tags: serde_json::from_str(&tags).unwrap_or_default(),
                order_index: row.get(11)?,
            })
        }
    ).map_err(|e| e.to_string())?;
    
    // Get user progress
    let progress = conn.query_row(
        "SELECT status, started_at, completed_at, progress_percentage, 
         exercises_completed, score, time_spent, attempts 
         FROM academy_user_progress 
         WHERE user_id = ?1 AND lesson_id = ?2",
        params![user_id, lesson_id],
        |row| {
            let exercises: String = row.get(4)?;
            Ok(UserLessonProgress {
                user_id: user_id.clone(),
                lesson_id: lesson_id.clone(),
                status: row.get(0)?,
                started_at: row.get(1)?,
                completed_at: row.get(2)?,
                progress_percentage: row.get(3)?,
                exercises_completed: serde_json::from_str(&exercises).unwrap_or_default(),
                score: row.get(5)?,
                time_spent: row.get(6)?,
                attempts: row.get(7)?,
            })
        }
    ).ok();
    
    // Get exercises
    let mut stmt = conn.prepare(
        "SELECT id, lesson_id, exercise_type, title, description, difficulty, 
         points, content, validation_rules, hints, solution, order_index 
         FROM academy_exercises 
         WHERE lesson_id = ?1 
         ORDER BY order_index"
    ).map_err(|e| e.to_string())?;
    
    let exercises = stmt.query_map(params![lesson_id], |row| {
        let hints: String = row.get(9)?;
        
        Ok(Exercise {
            id: row.get(0)?,
            lesson_id: row.get(1)?,
            exercise_type: row.get(2)?,
            title: row.get(3)?,
            description: row.get(4)?,
            difficulty: row.get(5)?,
            points: row.get(6)?,
            content: row.get(7)?,
            validation_rules: row.get(8)?,
            hints: serde_json::from_str(&hints).unwrap_or_default(),
            solution: row.get(10)?,
            order_index: row.get(11)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(json!({
        "lesson": lesson,
        "progress": progress,
        "exercises": exercises
    }))
}

#[tauri::command]
pub async fn start_academy_lesson(lesson_id: String, user_id: String) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO academy_user_progress 
         (user_id, lesson_id, status, started_at, progress_percentage, exercises_completed, score, time_spent, attempts) 
         VALUES (?1, ?2, 'in-progress', ?3, 0, '[]', 0, 0, 1)
         ON CONFLICT(user_id, lesson_id) DO UPDATE SET 
         status = 'in-progress',
         started_at = CASE WHEN started_at IS NULL THEN ?3 ELSE started_at END,
         attempts = attempts + 1",
        params![user_id, lesson_id, now],
    ).map_err(|e| e.to_string())?;
    
    // Update user stats
    update_user_stats(&conn, &user_id)?;
    
    Ok(())
}

#[tauri::command]
pub async fn complete_academy_lesson(
    lesson_id: String, 
    user_id: String, 
    score: i32,
    time_spent: i32
) -> Result<Value, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now().to_rfc3339();
    
    // Update lesson progress
    conn.execute(
        "UPDATE academy_user_progress 
         SET status = 'completed', 
             completed_at = ?1, 
             progress_percentage = 100.0,
             score = ?2,
             time_spent = time_spent + ?3
         WHERE user_id = ?4 AND lesson_id = ?5",
        params![now, score, time_spent, user_id, lesson_id],
    ).map_err(|e| e.to_string())?;
    
    // Check for achievements
    let achievements = check_achievements(&conn, &user_id)?;
    
    // Update user stats
    update_user_stats(&conn, &user_id)?;
    
    Ok(json!({
        "success": true,
        "achievements_unlocked": achievements
    }))
}

#[tauri::command]
pub async fn submit_exercise_solution(
    exercise_id: String,
    lesson_id: String,
    user_id: String,
    submission: String,
    time_spent: i32
) -> Result<Value, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    
    // Get exercise details
    let exercise: Exercise = conn.query_row(
        "SELECT id, lesson_id, exercise_type, title, description, difficulty, 
         points, content, validation_rules, hints, solution, order_index 
         FROM academy_exercises 
         WHERE id = ?1",
        params![exercise_id],
        |row| {
            let hints: String = row.get(9)?;
            
            Ok(Exercise {
                id: row.get(0)?,
                lesson_id: row.get(1)?,
                exercise_type: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                difficulty: row.get(5)?,
                points: row.get(6)?,
                content: row.get(7)?,
                validation_rules: row.get(8)?,
                hints: serde_json::from_str(&hints).unwrap_or_default(),
                solution: row.get(10)?,
                order_index: row.get(11)?,
            })
        }
    ).map_err(|e| e.to_string())?;
    
    // Validate the submission
    let validation_result = validate_exercise_submission(&exercise, &submission)?;
    let score = if validation_result.is_correct {
        exercise.points
    } else {
        0
    };
    
    // Save submission
    let submission_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO academy_exercise_submissions 
         (id, user_id, exercise_id, lesson_id, submission, is_correct, score, feedback, submitted_at, time_spent) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            submission_id, 
            user_id, 
            exercise_id, 
            lesson_id, 
            submission, 
            validation_result.is_correct,
            score,
            validation_result.feedback,
            now,
            time_spent
        ],
    ).map_err(|e| e.to_string())?;
    
    // Update lesson progress
    if validation_result.is_correct {
        update_lesson_exercise_progress(&conn, &user_id, &lesson_id, &exercise_id)?;
    }
    
    Ok(json!({
        "is_correct": validation_result.is_correct,
        "score": score,
        "feedback": validation_result.feedback,
        "hints_available": !exercise.hints.is_empty()
    }))
}

#[tauri::command]
pub async fn get_user_academy_stats(user_id: String) -> Result<UserStats, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    
    let stats = conn.query_row(
        "SELECT user_id, total_lessons_completed, total_exercises_solved, 
         total_points, total_time_spent, current_streak, longest_streak, 
         level, experience, achievements_unlocked, average_score, last_activity_date 
         FROM academy_user_stats 
         WHERE user_id = ?1",
        params![user_id],
        |row| {
            Ok(UserStats {
                user_id: row.get(0)?,
                total_lessons_completed: row.get(1)?,
                total_exercises_solved: row.get(2)?,
                total_points: row.get(3)?,
                total_time_spent: row.get(4)?,
                current_streak: row.get(5)?,
                longest_streak: row.get(6)?,
                level: row.get(7)?,
                experience: row.get(8)?,
                achievements_unlocked: row.get(9)?,
                average_score: row.get(10)?,
                last_activity_date: row.get(11)?,
            })
        }
    ).or_else(|_| {
        // Create default stats if not exists
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO academy_user_stats 
             (user_id, total_lessons_completed, total_exercises_solved, total_points, 
              total_time_spent, current_streak, longest_streak, level, experience, 
              achievements_unlocked, average_score, last_activity_date) 
             VALUES (?1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0.0, ?2)",
            params![user_id, now],
        ).map_err(|e| e.to_string())?;
        
        Ok(UserStats {
            user_id,
            total_lessons_completed: 0,
            total_exercises_solved: 0,
            total_points: 0,
            total_time_spent: 0,
            current_streak: 0,
            longest_streak: 0,
            level: 1,
            experience: 0,
            achievements_unlocked: 0,
            average_score: 0.0,
            last_activity_date: now,
        })
    })?;
    
    Ok(stats)
}

#[tauri::command]
pub async fn get_user_achievements(user_id: String) -> Result<Vec<Value>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT a.*, ua.unlocked_at, ua.progress 
         FROM academy_achievements a 
         LEFT JOIN academy_user_achievements ua 
         ON a.id = ua.achievement_id AND ua.user_id = ?1 
         ORDER BY a.points DESC"
    ).map_err(|e| e.to_string())?;
    
    let achievements = stmt.query_map(params![user_id], |row| {
        Ok(json!({
            "id": row.get::<_, String>(0)?,
            "name": row.get::<_, String>(1)?,
            "description": row.get::<_, String>(2)?,
            "icon": row.get::<_, String>(3)?,
            "category": row.get::<_, String>(4)?,
            "points": row.get::<_, i32>(8)?,
            "rarity": row.get::<_, String>(9)?,
            "unlocked": row.get::<_, Option<String>>(10)?.is_some(),
            "unlocked_at": row.get::<_, Option<String>>(10)?,
            "progress": row.get::<_, Option<f32>>(11)?.unwrap_or(0.0),
        }))
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(achievements)
}

#[tauri::command]
pub async fn initialize_academy_system() -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    seed_academy_content(&conn).map_err(|e| e.to_string())?;
    Ok(())
}

// Helper functions

fn validate_exercise_submission(exercise: &Exercise, submission: &str) -> Result<ValidationResult, String> {
    let validation_rules: Vec<ValidationRule> = serde_json::from_str(&exercise.validation_rules)
        .map_err(|e| e.to_string())?;
    
    let mut is_correct = true;
    let mut feedback = Vec::new();
    
    for rule in validation_rules {
        match rule.rule_type.as_str() {
            "exact" => {
                if submission.trim() != rule.value.trim() {
                    is_correct = false;
                    feedback.push(rule.message);
                }
            },
            "contains" => {
                if !submission.contains(&rule.value) {
                    is_correct = false;
                    feedback.push(rule.message);
                }
            },
            "regex" => {
                let re = regex::Regex::new(&rule.value).map_err(|e| e.to_string())?;
                if !re.is_match(submission) {
                    is_correct = false;
                    feedback.push(rule.message);
                }
            },
            _ => {}
        }
    }
    
    Ok(ValidationResult {
        is_correct,
        feedback: if feedback.is_empty() {
            Some("Great job! Your solution is correct.".to_string())
        } else {
            Some(feedback.join(" "))
        }
    })
}

fn update_lesson_exercise_progress(
    conn: &Connection, 
    user_id: &str, 
    lesson_id: &str, 
    exercise_id: &str
) -> Result<(), String> {
    // Get current exercises completed
    let exercises_json: String = conn.query_row(
        "SELECT exercises_completed FROM academy_user_progress WHERE user_id = ?1 AND lesson_id = ?2",
        params![user_id, lesson_id],
        |row| row.get(0)
    ).unwrap_or_else(|_| "[]".to_string());
    
    let mut exercises: Vec<String> = serde_json::from_str(&exercises_json).unwrap_or_default();
    
    if !exercises.contains(&exercise_id.to_string()) {
        exercises.push(exercise_id.to_string());
        
        let updated_json = serde_json::to_string(&exercises).map_err(|e| e.to_string())?;
        
        conn.execute(
            "UPDATE academy_user_progress 
             SET exercises_completed = ?1 
             WHERE user_id = ?2 AND lesson_id = ?3",
            params![updated_json, user_id, lesson_id],
        ).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

fn update_user_stats(conn: &Connection, user_id: &str) -> Result<(), String> {
    let now = chrono::Utc::now().to_rfc3339();
    
    // Calculate stats
    let lessons_completed: i32 = conn.query_row(
        "SELECT COUNT(*) FROM academy_user_progress WHERE user_id = ?1 AND status = 'completed'",
        params![user_id],
        |row| row.get(0)
    ).unwrap_or(0);
    
    let exercises_solved: i32 = conn.query_row(
        "SELECT COUNT(DISTINCT exercise_id) FROM academy_exercise_submissions 
         WHERE user_id = ?1 AND is_correct = 1",
        params![user_id],
        |row| row.get(0)
    ).unwrap_or(0);
    
    let total_points: i32 = conn.query_row(
        "SELECT COALESCE(SUM(score), 0) FROM academy_exercise_submissions WHERE user_id = ?1",
        params![user_id],
        |row| row.get(0)
    ).unwrap_or(0);
    
    // Update or insert stats
    conn.execute(
        "INSERT INTO academy_user_stats 
         (user_id, total_lessons_completed, total_exercises_solved, total_points, 
          total_time_spent, current_streak, longest_streak, level, experience, 
          achievements_unlocked, average_score, last_activity_date) 
         VALUES (?1, ?2, ?3, ?4, 0, 1, 1, 1, ?4, 0, 0.0, ?5)
         ON CONFLICT(user_id) DO UPDATE SET 
         total_lessons_completed = ?2,
         total_exercises_solved = ?3,
         total_points = ?4,
         experience = ?4,
         level = 1 + (?4 / 100),
         last_activity_date = ?5",
        params![user_id, lessons_completed, exercises_solved, total_points, now],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

fn check_achievements(conn: &Connection, user_id: &str) -> Result<Vec<String>, String> {
    let mut new_achievements = Vec::new();
    
    // Check for first lesson achievement
    let lessons_completed: i32 = conn.query_row(
        "SELECT COUNT(*) FROM academy_user_progress WHERE user_id = ?1 AND status = 'completed'",
        params![user_id],
        |row| row.get(0)
    ).unwrap_or(0);
    
    if lessons_completed == 1 {
        unlock_achievement(conn, user_id, "first_lesson")?;
        new_achievements.push("first_lesson".to_string());
    }
    
    // Add more achievement checks here...
    
    Ok(new_achievements)
}

fn unlock_achievement(conn: &Connection, user_id: &str, achievement_id: &str) -> Result<(), String> {
    let now = chrono::Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT OR IGNORE INTO academy_user_achievements 
         (user_id, achievement_id, unlocked_at, progress) 
         VALUES (?1, ?2, ?3, 100.0)",
        params![user_id, achievement_id, now],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[derive(Serialize, Deserialize)]
struct ValidationRule {
    rule_type: String,
    value: String,
    message: String,
}

struct ValidationResult {
    is_correct: bool,
    feedback: Option<String>,
}

// Re-export test commands from mod.rs
pub use super::{test_academy_database, initialize_academy_database, get_academy_stats};