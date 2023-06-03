const { exec } = require('child_process');

exec('ngrok http 3000', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  const urlRegex = /(http:\/\/[^\s]+)/;
  const urlMatch = stdout.match(urlRegex);
  if (urlMatch) {
    const url = urlMatch[0];
    console.log(`Captured URL: ${url}`);
    // Additional actions with the URL...
  }
});