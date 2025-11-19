// Quick test to verify dynamic imports work
async function testImport() {
  try {
    console.log('Testing import of ATic-tac-toeGame.tsx...');
    const module = await import('./src/generated-apps/ATic-tac-toeGame.tsx');
    console.log('Module loaded successfully!');
    console.log('Available exports:', Object.keys(module));
    console.log('TicTacToe component:', module.TicTacToe ? 'Found' : 'Not found');
  } catch (error) {
    console.error('Import failed:', error.message);
  }
}

testImport();
