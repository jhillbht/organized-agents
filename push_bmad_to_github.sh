#!/bin/bash

echo "🚀 Pushing Complete BMAD Implementation to GitHub..."

# Navigate to project directory
cd "/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/Organized Agents/organized-agents"

# Check current status
echo "📊 Current git status:"
git status --short

# Stage all files
echo "📦 Staging all files..."
git add .

# Show what's being committed
echo "📋 Files to be committed:"
git diff --cached --name-only

# Commit with comprehensive message
echo "💾 Committing BMAD implementation..."
git commit -m "🎯 Add Complete BMAD Methodology Implementation

✅ BMAD Components: AgentDispatcher, CommunicationBoard, WorkflowDisplay, ProjectCreator
✅ BMAD API Layer: Complete TypeScript API integration
✅ Educational Content: 7 comprehensive BMAD lessons
✅ 5-Phase Workflow: Planning → Story Creation → Development → QA → Complete
✅ 9 Agent Types: Analyst, Architect, PM, PO, SM, Dev, QA, UX, Orchestrator

This transforms Organized Agents into the world's first complete BMAD methodology implementation!

Built with ❤️ by BHT Labs / Organized AI"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Success! BMAD implementation pushed to GitHub!"
echo "🔗 Repository: https://github.com/jhillbht/organized-agents"
echo "🎉 Complete BMAD methodology now live on GitHub!"
