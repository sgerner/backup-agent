# CapRover Backup Agent

This application runs as a persistent service on CapRover and backs up all persistent data from other apps to a remote server using SFTP.

## Features

- Scheduled backups of all CapRover app data.
- Secure transfer of data using SFTP.
- Configurable backup schedule and remote server details.

## Configuration

The application is configured through environment variables in the Caprover dashboard.

### Environment Variables

- `REMOTE_HOST`: The hostname or IP address of the remote SFTP server.
- `REMOTE_PORT`: The port of the remote SFTP server (defaults to `22`).
- `REMOTE_USER`: The username for the remote SFTP server.
- `REMOTE_PASSWORD`: The password for the remote SFTP server.
- `REMOTE_PATH`: The path on the remote server to store the backups (defaults to `/backup`).
- `BACKUP_SCHEDULE`: A cron expression for the backup schedule (defaults to `0 2 * * *` - 2 AM daily).

## Deployment

1.  **Create a new app in CapRover.**
2.  **Enable App Persistence.** In the "Deployment" tab of your app, make sure to enable "App Persistence". This will allow the backup agent to access the data of other apps.
3.  **Set up Persistent Data Volumes.** For each app that you want to back up, you need to mount its persistent data volume into the backup agent's container. In the "App Configs" tab of the **backup agent app**, go to the "App Persistence" section and add a new volume for each app you want to back up.

    - **Path in App:** This is the path where the app's data will be mounted inside the backup agent's container. It is recommended to use a consistent naming scheme, for example, `/app-name`.
    - To ensure the backup agent can access the volume data, you must click on the **Set specific host path** button and provide the path to the volume on the host machine. You can typically find the volumes at `/var/lib/docker/volumes/<volume-name>/_data`. For CapRover apps, the volume names usually start with `captain--` followed by the app name and a unique identifier.

4.  **Set the Environment Variables.** In the "App Configs" tab, add the environment variables listed above.
5.  **Deploy the app.** You can deploy the app by either connecting your git repository to CapRover or by using the `caprover deploy` command.

### Deploying with Git

1.  Push this repository to a git provider (e.g., GitHub, GitLab).
2.  In the "Deployment" tab of your app in CapRover, select your git provider and repository.
3.  Click "Save & Update".

### Deploying with the CLI

1.  Install the CapRover CLI: `npm install -g caprover`
2.  Login to your CapRover instance: `caprover login`
3.  Deploy the app: `caprover deploy`
