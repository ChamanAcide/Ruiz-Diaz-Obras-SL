const { execSync } = require('child_process');
const fs = require('fs');

try {
    console.log('Running Vite build...');
    execSync('npx vite build', { stdio: 'inherit' });

    console.log('Copying static assets to dist...');
    fs.cpSync('assets', 'dist/assets', { recursive: true });
    
    console.log('Build complete! Assets copied successfully.');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
