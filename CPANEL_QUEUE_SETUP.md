# Running Laravel Queues on cPanel Shared Hosting

Since cPanel shared hosting doesn't allow long-running processes, we need to use cron jobs to process queues periodically instead of running `queue:work` continuously.

## Current Queue Configuration

- **Queue Driver**: Database (`QUEUE_CONNECTION=database`)
- **Queue Table**: `jobs` (already migrated)
- **Queued Jobs**: 
  - Email notifications (ContactNotificationMail, EnrollmentVerifiedMail, etc.)
  - Other background tasks

## Setup Instructions

### Step 1: Access cPanel Cron Jobs

1. Log in to your cPanel account
2. Navigate to **Advanced** → **Cron Jobs**
3. Or search for "Cron Jobs" in the cPanel search bar

### Step 2: Create Cron Job

Add a new cron job with the following settings:

**Common Settings:**
- **Minute**: `*` (every minute)
- **Hour**: `*` (every hour)
- **Day**: `*` (every day)
- **Month**: `*` (every month)
- **Weekday**: `*` (every weekday)

**Command:**
```bash
cd /home/your_username/backend.abhidh.com && /usr/local/bin/php artisan queue:work --stop-when-empty --tries=3 --timeout=60
```

**Important Notes:**
- Replace `your_username` with your actual cPanel username
- Replace `backend.abhidh.com` with your actual directory name if different
- The `--stop-when-empty` flag ensures the command exits after processing all pending jobs (required for cron)
- The `--tries=3` flag retries failed jobs up to 3 times
- The `--timeout=60` flag sets a 60-second timeout per job

### Step 3: Find PHP Path

To find the correct PHP path on your cPanel server:

1. In cPanel, go to **Software** → **Select PHP Version**
2. Note the PHP version you're using
3. Or SSH into your server and run:
   ```bash
   which php
   ```
4. Common PHP paths on cPanel:
   - `/usr/local/bin/php` (most common)
   - `/usr/bin/php`
   - `/opt/cpanel/ea-php81/root/usr/bin/php` (for PHP 8.1)
   - `/opt/cpanel/ea-php82/root/usr/bin/php` (for PHP 8.2)

### Step 4: Alternative - Less Frequent Processing

If you want to process queues less frequently (to reduce server load), you can adjust the cron schedule:

**Every 5 minutes:**
```
*/5 * * * *
```

**Every 10 minutes:**
```
*/10 * * * *
```

**Every 15 minutes:**
```
*/15 * * * *
```

### Step 5: Verify Queue Processing

After setting up the cron job:

1. **Check if jobs are being processed:**
   - Monitor the `jobs` table in your database
   - Jobs should move from `pending` to `processed` or be removed after successful processing

2. **Check cron job logs:**
   - In cPanel, go to **Advanced** → **Cron Jobs**
   - Click on **View Cron Logs** to see if the cron job is running

3. **Test manually:**
   - SSH into your server (if available)
   - Navigate to your project directory
   - Run: `php artisan queue:work --stop-when-empty`
   - This should process any pending jobs

## Troubleshooting

### Issue: Cron job not running

**Solutions:**
1. Verify the PHP path is correct
2. Verify the project path is correct
3. Check cron job logs in cPanel
4. Ensure file permissions are correct (755 for directories, 644 for files)

### Issue: Jobs not processing

**Solutions:**
1. Check if `QUEUE_CONNECTION=database` is set in `.env`
2. Verify the `jobs` table exists: `php artisan migrate:status`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Ensure the cron job command is correct

### Issue: Jobs failing

**Solutions:**
1. Check `failed_jobs` table: `php artisan queue:failed`
2. Review Laravel logs for error messages
3. Check email configuration in `.env`
4. Verify database connection

## Monitoring Queue Status

### Check Pending Jobs

Via SSH or cPanel Terminal:
```bash
cd /home/your_username/backend.abhidh.com
php artisan queue:monitor
```

### Check Failed Jobs

```bash
php artisan queue:failed
```

### Retry Failed Jobs

```bash
php artisan queue:retry all
```

## Alternative: Using Queue Listen (Not Recommended for Shared Hosting)

If your hosting provider allows it, you could use `queue:listen`, but this requires:
- SSH access
- Ability to run long-running processes
- Process manager (like Supervisor)

For shared hosting, the cron job approach is the recommended solution.

## Email Configuration

Ensure your `.env` file has correct mail settings:
```
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@abhidh.com
MAIL_FROM_NAME="${APP_NAME}"
```

## Notes

- The cron job runs every minute by default, which should be sufficient for most use cases
- If you have high email volume, you may want to run it more frequently
- Failed jobs will be stored in the `failed_jobs` table and can be retried manually
- Monitor your server resources - if processing takes too long, increase the interval

