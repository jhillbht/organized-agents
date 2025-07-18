use crate::bmad::types::{
    BMadError, AgentMessage, AgentType, MessageType, MessageStatus
};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use tracing::{debug, error, info, warn};
use uuid::Uuid;

pub struct CommunicationManager {
    project_path: PathBuf,
}

#[derive(Debug, Clone)]
pub struct MessageMetadata {
    pub id: Uuid,
    pub file_path: PathBuf,
    pub from_agent: AgentType,
    pub to_agent: Option<AgentType>,
    pub last_modified: DateTime<Utc>,
    pub message_type: MessageType,
}

impl CommunicationManager {
    pub fn new<P: AsRef<Path>>(project_path: P) -> Self {
        CommunicationManager {
            project_path: project_path.as_ref().to_path_buf(),
        }
    }

    pub fn load_all_messages(&self) -> Result<Vec<AgentMessage>, BMadError> {
        let communications_dir = self.project_path.join(".bmad").join("communications");
        
        if !communications_dir.exists() {
            return Ok(Vec::new());
        }

        let mut messages = Vec::new();
        
        for entry in std::fs::read_dir(&communications_dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_file() && path.extension().map_or(false, |ext| ext == "md") {
                match self.parse_message_file(&path) {
                    Ok(message) => messages.push(message),
                    Err(e) => {
                        warn!("Failed to parse message file {:?}: {}", path, e);
                    }
                }
            }
        }

        // Sort messages by timestamp
        messages.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
        
        info!("Loaded {} messages from communications directory", messages.len());
        Ok(messages)
    }

    pub fn load_messages_for_agent(&self, agent: &AgentType) -> Result<Vec<AgentMessage>, BMadError> {
        let all_messages = self.load_all_messages()?;
        
        Ok(all_messages.into_iter()
            .filter(|msg| msg.to_agent.as_ref() == Some(agent) || &msg.from_agent == agent)
            .collect())
    }

    pub fn save_message(&self, message: &AgentMessage) -> Result<PathBuf, BMadError> {
        let communications_dir = self.project_path.join(".bmad").join("communications");
        std::fs::create_dir_all(&communications_dir)?;

        let filename = self.generate_filename(message);
        let file_path = communications_dir.join(filename);

        let content = self.format_message_content(message)?;
        std::fs::write(&file_path, content)?;

        info!("Saved message {} to {:?}", message.id, file_path);
        Ok(file_path)
    }

    pub fn create_message(
        &self,
        from_agent: AgentType,
        to_agent: Option<AgentType>,
        content: String,
        message_type: MessageType,
        files_referenced: Vec<PathBuf>,
    ) -> AgentMessage {
        AgentMessage {
            id: Uuid::new_v4(),
            from_agent,
            to_agent,
            content,
            message_type,
            files_referenced,
            timestamp: Utc::now(),
            status: MessageStatus::Pending,
        }
    }

    pub fn mark_message_read(&self, message_id: Uuid) -> Result<(), BMadError> {
        // Find the message file and update its status
        let communications_dir = self.project_path.join(".bmad").join("communications");
        
        for entry in std::fs::read_dir(&communications_dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_file() && path.extension().map_or(false, |ext| ext == "md") {
                if let Ok(mut message) = self.parse_message_file(&path) {
                    if message.id == message_id {
                        message.status = MessageStatus::Read;
                        let content = self.format_message_content(&message)?;
                        std::fs::write(&path, content)?;
                        info!("Marked message {} as read", message_id);
                        return Ok(());
                    }
                }
            }
        }
        
        Err(BMadError::Communication(format!("Message not found: {}", message_id)))
    }

    pub fn get_latest_messages(&self, limit: usize) -> Result<Vec<AgentMessage>, BMadError> {
        let mut messages = self.load_all_messages()?;
        messages.sort_by(|a, b| b.timestamp.cmp(&a.timestamp)); // Newest first
        messages.truncate(limit);
        Ok(messages)
    }

    pub fn get_conversation_thread(
        &self, 
        agent1: &AgentType, 
        agent2: &AgentType
    ) -> Result<Vec<AgentMessage>, BMadError> {
        let all_messages = self.load_all_messages()?;
        
        Ok(all_messages.into_iter()
            .filter(|msg| {
                (msg.from_agent == *agent1 && msg.to_agent.as_ref() == Some(agent2)) ||
                (msg.from_agent == *agent2 && msg.to_agent.as_ref() == Some(agent1))
            })
            .collect())
    }

    fn parse_message_file<P: AsRef<Path>>(&self, file_path: P) -> Result<AgentMessage, BMadError> {
        let path = file_path.as_ref();
        let content = std::fs::read_to_string(path)?;
        
        // Extract metadata from filename and content
        let (from_agent, to_agent) = self.parse_agents_from_filename(path)?;
        let message_type = self.extract_message_type(&content);
        let files_referenced = self.extract_referenced_files(&content);
        let (id, timestamp, status) = self.extract_metadata(&content)?;
        
        Ok(AgentMessage {
            id,
            from_agent,
            to_agent,
            content,
            message_type,
            files_referenced,
            timestamp,
            status,
        })
    }

    fn parse_agents_from_filename<P: AsRef<Path>>(&self, file_path: P) -> Result<(AgentType, Option<AgentType>), BMadError> {
        let filename = file_path.as_ref()
            .file_stem()
            .and_then(|stem| stem.to_str())
            .ok_or_else(|| BMadError::Communication("Invalid filename".to_string()))?;

        if filename.contains("-to-") {
            let parts: Vec<&str> = filename.split("-to-").collect();
            if parts.len() == 2 {
                let from_agent = self.parse_agent_name(parts[0])?;
                let to_agent = self.parse_agent_name(parts[1])?;
                return Ok((from_agent, Some(to_agent)));
            }
        }

        // Fallback to parsing single agent name
        let from_agent = self.parse_agent_name(filename)?;
        Ok((from_agent, None))
    }

    fn parse_agent_name(&self, name: &str) -> Result<AgentType, BMadError> {
        match name.to_lowercase().as_str() {
            "analyst" => Ok(AgentType::Analyst),
            "architect" => Ok(AgentType::Architect),
            "pm" | "product-manager" | "product_manager" => Ok(AgentType::ProductManager),
            "po" | "product-owner" | "product_owner" => Ok(AgentType::ProductOwner),
            "sm" | "scrum-master" | "scrum_master" => Ok(AgentType::ScrumMaster),
            "dev" | "developer" => Ok(AgentType::Developer),
            "qa" | "quality-assurance" | "quality_assurance" => Ok(AgentType::QualityAssurance),
            "ux" | "ux-expert" | "ux_expert" => Ok(AgentType::UXExpert),
            "orchestrator" | "bmad-orchestrator" | "bmad_orchestrator" => Ok(AgentType::BMadOrchestrator),
            _ => Err(BMadError::Communication(format!("Unknown agent name: {}", name)))
        }
    }

    fn extract_message_type(&self, content: &str) -> MessageType {
        if content.contains("## Handoff") || content.contains("handoff") {
            MessageType::Handoff
        } else if content.contains("## Question") || content.contains("?") {
            MessageType::Question
        } else if content.contains("## Update") || content.contains("Status:") {
            MessageType::Update
        } else if content.contains("## Complete") || content.contains("✅") {
            MessageType::Completion
        } else if content.contains("## Blocker") || content.contains("blocked") {
            MessageType::BlockerReport
        } else {
            MessageType::ContextShare
        }
    }

    fn extract_referenced_files(&self, content: &str) -> Vec<PathBuf> {
        let mut files = Vec::new();
        
        // Look for markdown file references
        for line in content.lines() {
            if line.contains("](") || line.contains("- `") {
                // Extract file paths from markdown links and code blocks
                if let Some(start) = line.find('`') {
                    if let Some(end) = line[start+1..].find('`') {
                        let file_ref = &line[start+1..start+1+end];
                        if file_ref.contains('/') || file_ref.contains('.') {
                            files.push(PathBuf::from(file_ref));
                        }
                    }
                }
            }
        }
        
        files
    }

    fn extract_metadata(&self, content: &str) -> Result<(Uuid, DateTime<Utc>, MessageStatus), BMadError> {
        let mut id = Uuid::new_v4();
        let mut timestamp = Utc::now();
        let mut status = MessageStatus::Pending;

        // Look for metadata in the content
        for line in content.lines() {
            if line.starts_with("**Last Updated:**") || line.starts_with("**Timestamp:**") {
                if let Some(time_str) = line.split(':').nth(1) {
                    let time_str = time_str.trim();
                    if let Ok(parsed_time) = DateTime::parse_from_rfc3339(time_str) {
                        timestamp = parsed_time.with_timezone(&Utc);
                    } else if let Ok(parsed_time) = chrono::NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M UTC") {
                        timestamp = DateTime::from_naive_utc_and_offset(parsed_time, Utc);
                    }
                }
            } else if line.starts_with("**Status:**") {
                if let Some(status_str) = line.split(':').nth(1) {
                    match status_str.trim().to_lowercase().as_str() {
                        "pending" => status = MessageStatus::Pending,
                        "read" => status = MessageStatus::Read,
                        "processed" => status = MessageStatus::Processed,
                        "archived" => status = MessageStatus::Archived,
                        _ => {}
                    }
                }
            }
        }

        Ok((id, timestamp, status))
    }

    fn generate_filename(&self, message: &AgentMessage) -> String {
        let from_name = self.agent_to_filename(&message.from_agent);
        
        if let Some(to_agent) = &message.to_agent {
            let to_name = self.agent_to_filename(to_agent);
            format!("{}-to-{}.md", from_name, to_name)
        } else {
            format!("{}-status.md", from_name)
        }
    }

    fn agent_to_filename(&self, agent: &AgentType) -> &'static str {
        match agent {
            AgentType::Analyst => "analyst",
            AgentType::Architect => "architect",
            AgentType::ProductManager => "pm",
            AgentType::ProductOwner => "po",
            AgentType::ScrumMaster => "sm",
            AgentType::Developer => "dev",
            AgentType::QualityAssurance => "qa",
            AgentType::UXExpert => "ux",
            AgentType::BMadOrchestrator => "orchestrator",
        }
    }

    fn format_message_content(&self, message: &AgentMessage) -> Result<String, BMadError> {
        let from_name = self.agent_display_name(&message.from_agent);
        let to_name = message.to_agent.as_ref()
            .map(|agent| self.agent_display_name(agent))
            .unwrap_or("Team".to_string());

        let message_type_header = match message.message_type {
            MessageType::Handoff => "## Handoff",
            MessageType::Question => "## Question",
            MessageType::Update => "## Status Update", 
            MessageType::Completion => "## Task Complete",
            MessageType::BlockerReport => "## Blocker Report",
            MessageType::ContextShare => "## Context Share",
        };

        let status_emoji = match message.status {
            MessageStatus::Pending => "⏳",
            MessageStatus::Read => "👀",
            MessageStatus::Processed => "✅",
            MessageStatus::Archived => "📁",
        };

        let mut content = format!(
            "# {} → {} Communication\n\n{} {}\n\n**Last Updated:** {}  \n**Status:** {:?} {}  \n**Message ID:** {}\n\n",
            from_name,
            to_name,
            message_type_header,
            status_emoji,
            message.timestamp.format("%Y-%m-%d %H:%M UTC"),
            message.status,
            status_emoji,
            message.id
        );

        content.push_str(&message.content);

        if !message.files_referenced.is_empty() {
            content.push_str("\n\n### Referenced Files\n");
            for file in &message.files_referenced {
                content.push_str(&format!("- `{}`\n", file.display()));
            }
        }

        content.push_str("\n\n---\n*Generated by BMAD Desktop*\n");

        Ok(content)
    }

    fn agent_display_name(&self, agent: &AgentType) -> String {
        match agent {
            AgentType::Analyst => "Analyst",
            AgentType::Architect => "Architect",
            AgentType::ProductManager => "Product Manager",
            AgentType::ProductOwner => "Product Owner",
            AgentType::ScrumMaster => "Scrum Master",
            AgentType::Developer => "Developer",
            AgentType::QualityAssurance => "QA",
            AgentType::UXExpert => "UX Expert",
            AgentType::BMadOrchestrator => "BMAD Orchestrator",
        }.to_string()
    }

    pub fn archive_old_messages(&self, days_old: u64) -> Result<usize, BMadError> {
        let cutoff_date = Utc::now() - chrono::Duration::days(days_old as i64);
        let messages = self.load_all_messages()?;
        let mut archived_count = 0;

        for mut message in messages {
            if message.timestamp < cutoff_date && message.status != MessageStatus::Archived {
                message.status = MessageStatus::Archived;
                self.save_message(&message)?;
                archived_count += 1;
            }
        }

        info!("Archived {} old messages", archived_count);
        Ok(archived_count)
    }

    pub fn get_unread_message_count(&self) -> Result<usize, BMadError> {
        let messages = self.load_all_messages()?;
        Ok(messages.iter()
            .filter(|msg| msg.status == MessageStatus::Pending)
            .count())
    }
}