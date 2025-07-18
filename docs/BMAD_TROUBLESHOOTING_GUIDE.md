# BMAD Desktop Troubleshooting Guide

## Table of Contents

1. [Common Issues](#common-issues)
2. [Project Creation Problems](#project-creation-problems)
3. [Agent Dispatch Issues](#agent-dispatch-issues)
4. [Communication Problems](#communication-problems)
5. [Performance Issues](#performance-issues)
6. [Integration Problems](#integration-problems)
7. [Education System Issues](#education-system-issues)
8. [Error Messages](#error-messages)
9. [Recovery Procedures](#recovery-procedures)
10. [Getting Support](#getting-support)

## Common Issues

### Application Won't Start

**Symptoms:**
- BMAD Desktop doesn't launch
- Splash screen appears but app doesn't open
- Immediate crash on startup

**Solutions:**

1. **Check System Requirements**
   - macOS 10.15+ or Windows 10+ or Ubuntu 20.04+
   - 4GB RAM minimum (8GB recommended)
   - 500MB free disk space

2. **Clear Application Cache**
   ```bash
   # macOS/Linux
   rm -rf ~/.bmad/cache
   
   # Windows
   rmdir /s %APPDATA%\bmad\cache
   ```

3. **Reset Configuration**
   ```bash
   # Backup current config first
   cp ~/.bmad/config.json ~/.bmad/config.backup.json
   
   # Reset to defaults
   rm ~/.bmad/config.json
   ```

4. **Check Logs**
   - Location: `~/.bmad/logs/bmad-desktop.log`
   - Look for error messages at startup

### Login/Authentication Issues

**Symptoms:**
- Can't log in to BMAD Desktop
- Authentication token expired
- "Invalid credentials" error

**Solutions:**

1. **Reset Authentication**
   - Click "Forgot Password" on login screen
   - Check email for reset link
   - Create new password

2. **Clear Stored Credentials**
   ```bash
   # Remove stored tokens
   rm ~/.bmad/auth/tokens.json
   ```

3. **Check Network Connection**
   - Ensure internet connectivity
   - Check firewall settings
   - Verify proxy configuration

## Project Creation Problems

### "Failed to Create Project" Error

**Common Causes:**
- Invalid directory path
- Insufficient permissions
- Directory already contains a BMAD project
- Special characters in project name

**Solutions:**

1. **Verify Directory Permissions**
   ```bash
   # Check write permissions
   ls -la /path/to/project/parent
   
   # Fix permissions if needed
   chmod 755 /path/to/project/parent
   ```

2. **Remove Special Characters**
   - Use only letters, numbers, hyphens, and underscores
   - Avoid spaces in directory paths
   - Don't use reserved system names

3. **Check for Existing Projects**
   ```bash
   # Look for existing .bmad directory
   ls -la /path/to/project/.bmad
   
   # Remove if corrupted
   rm -rf /path/to/project/.bmad
   ```

### Project Wizard Freezes

**Symptoms:**
- Wizard becomes unresponsive
- Can't proceed to next step
- Validation never completes

**Solutions:**

1. **Force Refresh**
   - Press `Ctrl+R` (or `Cmd+R` on macOS)
   - Wait for wizard to reload

2. **Check Validation Errors**
   - Look for red error messages
   - Ensure all required fields are filled
   - Verify path accessibility

3. **Restart Wizard**
   - Cancel current wizard
   - Close project creator
   - Start fresh

## Agent Dispatch Issues

### Agents Not Responding

**Symptoms:**
- Dispatched agents show no activity
- Status remains "idle" after dispatch
- No handoff acknowledgment

**Solutions:**

1. **Check Agent Configuration**
   ```yaml
   # Verify in .bmad/agents.yaml
   agents:
     developer:
       enabled: true
       status: active
   ```

2. **Restart Agent Services**
   - Go to Settings → Agents
   - Click "Restart All Agents"
   - Wait for status update

3. **Verify API Keys**
   - Check Settings → Integrations
   - Ensure AI provider keys are valid
   - Test connection

### Dispatch Recommendations Not Appearing

**Symptoms:**
- Empty recommendation list
- "No recommendations" message
- Dispatch center blank

**Solutions:**

1. **Refresh Recommendations**
   - Click refresh button in dispatch center
   - Wait for analysis to complete

2. **Check Project State**
   ```yaml
   # Verify in .bmad/state.yaml
   current_phase: "development"  # Must be valid phase
   total_stories: 5              # Must have stories
   ```

3. **Validate Prerequisites**
   - Ensure previous phases completed
   - Check for blocking dependencies
   - Review agent availability

### IDE Launch Failures

**Symptoms:**
- "Failed to launch IDE" error
- IDE opens but without project
- Wrong IDE launches

**Solutions:**

1. **Verify IDE Installation**
   ```bash
   # Check if IDE is in PATH
   which code  # For VS Code
   which idea  # For IntelliJ
   ```

2. **Update IDE Preferences**
   - Go to Settings → IDEs
   - Re-select preferred IDE
   - Test launch button

3. **Check IDE Extensions**
   - Ensure BMAD extension installed
   - Update to latest version
   - Restart IDE

## Communication Problems

### Messages Not Sending

**Symptoms:**
- Messages stuck in "sending" state
- No delivery confirmation
- Recipients don't receive messages

**Solutions:**

1. **Check Network Connection**
   - Verify internet connectivity
   - Test other online features
   - Check proxy settings

2. **Clear Message Queue**
   ```bash
   # Clear pending messages
   rm ~/.bmad/queue/messages/*.pending
   ```

3. **Verify Agent Status**
   - Ensure recipient agent is active
   - Check agent communication settings
   - Verify routing configuration

### Communication Board Not Loading

**Symptoms:**
- Blank communication board
- Infinite loading spinner
- Error loading messages

**Solutions:**

1. **Rebuild Message Index**
   ```bash
   # In project directory
   bmad rebuild-index --messages
   ```

2. **Check File Permissions**
   ```bash
   # Verify read permissions
   ls -la .bmad/communications/
   ```

3. **Clear Board Cache**
   - Settings → Advanced → Clear Cache
   - Select "Communication Board"
   - Restart application

## Performance Issues

### Slow Application Performance

**Symptoms:**
- UI lag and stuttering
- Slow project loading
- Delayed responses

**Solutions:**

1. **Optimize Project Size**
   ```bash
   # Archive old communications
   bmad archive --older-than 30d
   
   # Compress project data
   bmad optimize
   ```

2. **Increase Memory Allocation**
   ```json
   // In settings.json
   {
     "performance": {
       "maxMemory": "4096m",
       "cacheSize": "512m"
     }
   }
   ```

3. **Disable Animations**
   - Settings → Appearance → Animations
   - Toggle "Reduce Motion"

### High CPU Usage

**Symptoms:**
- Fan running constantly
- System slowdown
- Battery drain (laptops)

**Solutions:**

1. **Limit Background Processes**
   - Settings → Performance
   - Reduce "Max Background Tasks"
   - Disable auto-refresh

2. **Check for Runaway Agents**
   ```bash
   # View agent resource usage
   bmad agents --stats
   
   # Stop problematic agents
   bmad agent stop <agent-name>
   ```

## Integration Problems

### Git Integration Not Working

**Symptoms:**
- Can't commit from BMAD
- Git status not updating
- Push/pull failures

**Solutions:**

1. **Verify Git Installation**
   ```bash
   git --version
   ```

2. **Check Git Configuration**
   ```bash
   # In project directory
   git config --list
   ```

3. **Re-authenticate Git**
   - Settings → Integrations → Git
   - Click "Re-authenticate"
   - Follow OAuth flow

### External Tool Connection Failed

**Symptoms:**
- Can't connect to Jira/GitHub/etc.
- API errors
- Sync not working

**Solutions:**

1. **Verify API Credentials**
   - Check API keys/tokens
   - Ensure not expired
   - Verify permissions

2. **Test Connection**
   ```bash
   # Test API endpoint
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://api.service.com/test
   ```

3. **Check Network Settings**
   - Firewall rules
   - Proxy configuration
   - SSL certificates

## Education System Issues

### Lessons Not Loading

**Symptoms:**
- Blank education tab
- "Failed to load lessons" error
- Progress not saving

**Solutions:**

1. **Reset Education Cache**
   ```bash
   rm -rf ~/.bmad/education/cache
   ```

2. **Verify Education API**
   - Settings → Education
   - Test connection
   - Check API status

3. **Reload Lesson Data**
   - Education tab → Settings
   - Click "Reload All Lessons"

### Progress Not Tracking

**Symptoms:**
- Completed lessons not marked
- Score not updating
- Achievements not unlocking

**Solutions:**

1. **Force Progress Sync**
   ```bash
   bmad education sync --force
   ```

2. **Check User Profile**
   - Ensure logged in
   - Verify user ID matches

3. **Reset Progress Tracking**
   - Settings → Education → Advanced
   - "Reset Progress Tracking"
   - Note: This won't delete progress

## Error Messages

### Common Error Codes

**BMD-001: Project Creation Failed**
- Check directory permissions
- Verify path exists
- Remove special characters

**BMD-002: Agent Dispatch Failed**
- Verify agent configuration
- Check API keys
- Ensure agent is enabled

**BMD-003: Communication Error**
- Check network connection
- Verify message format
- Clear message queue

**BMD-004: State Corruption**
- Run state recovery
- Restore from backup
- Contact support

**BMD-005: Integration Failure**
- Verify credentials
- Check service status
- Review integration logs

### Error Reporting

When encountering errors:

1. **Capture Error Details**
   - Screenshot error message
   - Note error code
   - Save recent actions

2. **Collect Logs**
   ```bash
   # Create diagnostic bundle
   bmad diagnostic --bundle
   ```

3. **Report Issue**
   - Use in-app feedback
   - Include diagnostic bundle
   - Describe steps to reproduce

## Recovery Procedures

### Corrupted Project Recovery

**Steps:**

1. **Backup Current State**
   ```bash
   cp -r .bmad .bmad.backup
   ```

2. **Run Recovery Tool**
   ```bash
   bmad recover --project /path/to/project
   ```

3. **Verify Recovery**
   - Check project loads
   - Verify data integrity
   - Test basic operations

### State File Recovery

**If state.yaml is corrupted:**

1. **Use Backup**
   ```bash
   # Recent backups stored automatically
   ls .bmad/backups/state/
   
   # Restore most recent
   cp .bmad/backups/state/state-20240215.yaml .bmad/state.yaml
   ```

2. **Rebuild from History**
   ```bash
   bmad rebuild-state --from-history
   ```

### Complete Reset

**Last Resort - Full Reset:**

1. **Export Important Data**
   ```bash
   bmad export --all --output ~/bmad-backup
   ```

2. **Uninstall Application**
   - Use system uninstaller
   - Remove all data

3. **Clean Install**
   - Download latest version
   - Install fresh
   - Import backed up data

## Getting Support

### Self-Service Resources

1. **Built-in Help**
   - Press `F1` for context help
   - Use `?` for keyboard shortcuts
   - Check tooltips

2. **Documentation**
   - [Quick Start Guide](./BMAD_QUICK_START_GUIDE.md)
   - [Methodology Reference](./BMAD_METHODOLOGY_REFERENCE.md)
   - [Features Documentation](./BMAD_FEATURES_DOCUMENTATION.md)

3. **Education System**
   - Complete troubleshooting lesson
   - Watch video tutorials
   - Practice with exercises

### Community Support

1. **Forums**
   - https://community.bmad.dev
   - Search existing topics
   - Post new questions

2. **Discord Server**
   - Real-time chat support
   - Community experts
   - Regular office hours

3. **GitHub Issues**
   - Report bugs
   - Request features
   - Track progress

### Professional Support

**For Enterprise Users:**

1. **Priority Support**
   - Email: support@bmad.dev
   - Response within 4 hours
   - Dedicated support engineer

2. **Phone Support**
   - Call: 1-800-BMAD-HELP
   - Available 24/7
   - Remote assistance available

3. **On-Site Support**
   - For critical issues
   - Expert consultation
   - Training sessions

### Diagnostic Information

When contacting support, provide:

1. **System Information**
   ```bash
   bmad info --system
   ```

2. **Project Information**
   ```bash
   bmad info --project
   ```

3. **Recent Logs**
   ```bash
   bmad logs --recent --export
   ```

4. **Steps to Reproduce**
   - Exact sequence of actions
   - Expected vs actual behavior
   - Any error messages

---

## Preventive Maintenance

### Regular Maintenance Tasks

**Daily:**
- Review error logs
- Check agent status
- Monitor performance

**Weekly:**
- Clear old cache files
- Archive completed communications
- Update integrations

**Monthly:**
- Full backup
- Performance optimization
- Update software

### Best Practices

1. **Keep Software Updated**
   - Enable auto-updates
   - Review changelog
   - Test in staging first

2. **Regular Backups**
   - Automated daily backups
   - Off-site backup storage
   - Test restore procedures

3. **Monitor System Health**
   - Set up alerts
   - Track key metrics
   - Address issues early

---

**Remember:** Most issues can be resolved by:
1. Restarting the application
2. Clearing cache
3. Checking logs
4. Updating to latest version

If problems persist, don't hesitate to contact support!