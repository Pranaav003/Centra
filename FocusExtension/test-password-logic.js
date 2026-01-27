// Test script for password protection logic
// This simulates the extension's password protection behavior

console.log('🧪 Testing Focus Extension Password Protection Logic\n');

// Mock data
let passwordEnabled = true;
let blockingPassword = 'test123';
let pendingSiteToRemove = null;
let blockedSites = ['youtube.com', 'facebook.com', 'twitter.com'];

// Mock functions
function showPasswordContainer() {
  console.log('🔒 Password container shown');
  if (pendingSiteToRemove) {
    console.log(`   Message: "Enter password to remove "${pendingSiteToRemove.site}" from block list"`);
  } else {
    console.log('   Message: "Enter password to disable blocking"');
  }
}

function performSiteRemoval(site, index) {
  console.log(`✅ Site "${site}" removed successfully`);
  blockedSites.splice(index, 1);
  console.log(`   Remaining sites: [${blockedSites.join(', ')}]`);
}

function removeSite(site, index) {
  console.log(`\n🗑️ Attempting to remove site: "${site}"`);
  
  if (passwordEnabled) {
    console.log('   Password protection enabled - showing password modal');
    pendingSiteToRemove = { site, index };
    showPasswordContainer();
    return;
  }
  
  console.log('   Password protection disabled - removing directly');
  performSiteRemoval(site, index);
}

function handlePasswordSubmit(enteredPassword) {
  console.log(`\n🔑 Password submitted: "${enteredPassword}"`);
  
  if (enteredPassword === blockingPassword) {
    console.log('   ✅ Password correct!');
    if (pendingSiteToRemove) {
      console.log('   Proceeding with site removal...');
      performSiteRemoval(pendingSiteToRemove.site, pendingSiteToRemove.index);
      pendingSiteToRemove = null;
    } else {
      console.log('   Proceeding with blocking toggle...');
    }
  } else {
    console.log('   ❌ Password incorrect!');
  }
}

// Test Cases
console.log('=== Test Case 1: Remove site with password protection enabled ===');
removeSite('youtube.com', 0);
handlePasswordSubmit('test123');

console.log('\n=== Test Case 2: Remove site with wrong password ===');
removeSite('facebook.com', 0);
handlePasswordSubmit('wrongpassword');

console.log('\n=== Test Case 3: Remove site with correct password after wrong attempt ===');
handlePasswordSubmit('test123');

console.log('\n=== Test Case 4: Disable password protection and remove site ===');
passwordEnabled = false;
removeSite('twitter.com', 0);

console.log('\n=== Test Case 5: Test blocking toggle with password protection ===');
passwordEnabled = true;
pendingSiteToRemove = null;
console.log('\n🔌 Attempting to toggle blocking off');
if (passwordEnabled) {
  console.log('   Password protection enabled - showing password modal');
  showPasswordContainer();
}
handlePasswordSubmit('test123');

console.log('\n✅ All tests completed!');


