# 🔒 Focus Password Protection Test Plan

## Test Environment
- **Web App:** http://localhost:3001
- **Backend:** http://localhost:5001
- **Extension:** Chrome Extension (to be loaded)
- **Test Account:** test@example.com / password123

## Test Cases

### 1. Web App Password Protection Tests

#### 1.1 Enable Password Protection
- [ ] Sign in to web app
- [ ] Go to Settings → Privacy
- [ ] Enable password protection
- [ ] Set password (e.g., "test123")
- [ ] Verify password is saved

#### 1.2 Test Website Deletion with Password Protection
- [ ] Add websites to block list (youtube.com, facebook.com, twitter.com)
- [ ] Try to remove a website
- [ ] Verify password modal appears
- [ ] Verify modal shows correct message: "Enter your password to remove [site] from block list"
- [ ] Test with correct password - should remove site
- [ ] Test with incorrect password - should show error
- [ ] Test cancel button - should abort removal

#### 1.3 Test Blocking Toggle with Password Protection
- [ ] Try to turn off blocking
- [ ] Verify password modal appears
- [ ] Verify modal shows: "Enter your password to disable website blocking"
- [ ] Test with correct password - should disable blocking
- [ ] Test with incorrect password - should show error

### 2. Extension Password Protection Tests

#### 2.1 Load Extension
- [ ] Go to chrome://extensions/
- [ ] Enable Developer mode
- [ ] Load unpacked extension from WebBlocker/FocusExtension folder
- [ ] Verify extension loads without errors

#### 2.2 Test Extension Website Deletion
- [ ] Add websites to block list in extension
- [ ] Try to remove a website
- [ ] Verify password modal appears
- [ ] Verify modal shows: "Enter password to remove [site] from block list"
- [ ] Test with correct password - should remove site
- [ ] Test with incorrect password - should show error

#### 2.3 Test Extension Blocking Toggle
- [ ] Try to turn off blocking in extension
- [ ] Verify password modal appears
- [ ] Verify modal shows: "Enter password to disable blocking"
- [ ] Test with correct password - should disable blocking

### 3. Cross-Platform Consistency Tests

#### 3.1 Password Synchronization
- [ ] Set password in web app
- [ ] Verify extension uses same password
- [ ] Change password in web app
- [ ] Verify extension uses new password

#### 3.2 Data Synchronization
- [ ] Add website in web app
- [ ] Verify it appears in extension
- [ ] Remove website in extension
- [ ] Verify it's removed in web app

### 4. Edge Cases

#### 4.1 No Password Protection
- [ ] Disable password protection in web app
- [ ] Verify website deletion works without password
- [ ] Verify blocking toggle works without password

#### 4.2 Extension Without Password Protection
- [ ] Disable password protection
- [ ] Verify extension website deletion works without password
- [ ] Verify extension blocking toggle works without password

## Expected Results

### ✅ Success Criteria
- Password protection works consistently across web app and extension
- Correct error messages are displayed
- User experience is smooth and intuitive
- No JavaScript errors in console
- Data synchronization works properly

### ❌ Failure Criteria
- Password protection doesn't work
- Inconsistent behavior between platforms
- JavaScript errors
- Data not syncing properly
- Poor user experience

## Test Execution Log

### Test Run 1: [Date/Time]
- **Status:** [PASS/FAIL]
- **Issues Found:** [List any issues]
- **Notes:** [Additional observations]

---

## Quick Test Commands

```bash
# Check web app status
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001

# Check backend status  
curl -s http://localhost:5001/health

# Check extension files
ls -la WebBlocker/FocusExtension/
```


