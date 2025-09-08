const cron = require('node-cron');
const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const sftp = new Client();

const REMOTE_HOST = process.env.REMOTE_HOST;
const REMOTE_PORT = process.env.REMOTE_PORT || 22;
const REMOTE_USER = process.env.REMOTE_USER;
const REMOTE_PASSWORD = process.env.REMOTE_PASSWORD;
const REMOTE_PATH = process.env.REMOTE_PATH || '/backup';
const BACKUP_SCHEDULE = process.env.BACKUP_SCHEDULE || '0 2 * * *'; // Default to 2 AM daily
const CAPROVER_DATA_PATH = '/captain/data/apps';

async function backup() {
    console.log('Starting backup...');

    try {
        await sftp.connect({
            host: REMOTE_HOST,
            port: REMOTE_PORT,
            username: REMOTE_USER,
            password: REMOTE_PASSWORD,
        });

        const apps = fs.readdirSync(CAPROVER_DATA_PATH);

        for (const app of apps) {
            const appPath = path.join(CAPROVER_DATA_PATH, app);
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

        console.log('Backup process finished.');
    } catch (err) {
        console.error('Failed to connect to remote server:', err);
    } finally {
        sftp.end();
    }
}

cron.schedule(BACKUP_SCHEDULE, () => {
    console.log('Running scheduled backup...');
    backup();
});

console.log('Backup agent started. Waiting for scheduled backup...');

// Run a backup on startup for testing purposes
backup();
