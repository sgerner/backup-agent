const cron = require("node-cron");
const Client = require("ssh2-sftp-client");
const fs = require("fs");
const path = require("path");

const sftp = new Client();

const REMOTE_HOST = process.env.REMOTE_HOST;
const REMOTE_PORT = process.env.REMOTE_PORT || 22;
const REMOTE_USER = process.env.REMOTE_USER;
const REMOTE_PASSWORD = process.env.REMOTE_PASSWORD;
const REMOTE_PATH = process.env.REMOTE_PATH || "/backup";
const BACKUP_SCHEDULE = process.env.BACKUP_SCHEDULE || "0 2 * * *"; // Default to 2 AM daily
const BACKUP_PATH = "/";

async function backup() {
  console.log("Starting backup...");

  try {
    await sftp.connect({
      host: REMOTE_HOST,
      port: REMOTE_PORT,
      username: REMOTE_USER,
      password: REMOTE_PASSWORD,
    });

    const apps = fs.readdirSync(BACKUP_PATH);

    for (const app of apps) {
      const appPath = path.join(BACKUP_PATH, app);
      const remoteAppPath = path.join(REMOTE_PATH, app);

      console.log(`Backing up ${app}...`);

      try {
        await sftp.mkdir(remoteAppPath, true);
        await sftp.uploadDir(appPath, remoteAppPath);
        console.log(`Backup of ${app} completed.`);
      } catch (err) {
        console.error(`Error backing up ${app}:`, err);
      }
    }

    console.log("Backup process finished.");
  } catch (err) {
    console.error("Failed to connect to remote server:", err);
  } finally {
    sftp.end();
  }
}

cron.schedule(BACKUP_SCHEDULE, () => {
  console.log("Running scheduled backup...");
  backup();
});

console.log("Backup agent started. Waiting for scheduled backup...");

const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/backup' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Backup triggered! Check the logs for progress.\n');
        console.log('Manual backup triggered via web interface.');
        backup();
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found\n');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Run a backup on startup for testing purposes
backup();

