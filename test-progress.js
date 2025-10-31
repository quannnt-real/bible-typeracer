import { countActiveUserProgress, deleteUserProgress } from './server/utils/user-progress-db.ts';

// Test count function
async function testCount() {
  console.log('Testing countActiveUserProgress...');
  const count = await countActiveUserProgress('test_user');
  console.log('Count for test_user:', count);
}

// Test delete function
async function testDelete() {
  console.log('Testing deleteUserProgress...');
  try {
    await deleteUserProgress('test_user', 'progress_6');
    console.log('Deleted progress_6 successfully');
  } catch (error) {
    console.error('Error deleting:', error);
  }
}

// Run tests
testCount().then(() => {
  return testDelete();
}).then(() => {
  return testCount();
}).then(() => {
  console.log('All tests completed');
});