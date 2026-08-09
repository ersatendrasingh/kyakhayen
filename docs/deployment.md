# Kyakhayen Deployment

## Vercel Hobby Runtime

Kyakhayen runs on Vercel Hobby with Upstash Redis as the BullMQ queue backend. The worker also runs on Vercel as a short-lived Next.js function at `/api/cron/meal-plan-worker`.

Do not register frequent jobs in `vercel.json` on the Hobby plan. Vercel Hobby only allows cron schedules that run once per day, so expressions such as `* * * * *` or `0 */6 * * *` make deployment fail. Use an external free HTTP scheduler, such as cron-job.org, to wake the Vercel worker endpoint instead.

### Runtime Layout

- Web app: Vercel Next.js production deployment.
- Queue backend: Upstash Redis through `REDIS_URL`.
- Worker execution: Vercel function `/api/cron/meal-plan-worker`.
- Worker wake-up: cron-job.org calls the Vercel function on a schedule.
- Storage: keep `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_MEDIA_BUCKET_NAME`, and `AWS_PRIVATE_BUCKET_NAME` unchanged.

### Required Vercel Environment Variables

Set these in Vercel Project Settings for Production:

- `NEXT_PUBLIC_APP_URL=https://www.kyakhayen.com`
- `AUTH_URL=https://www.kyakhayen.com`
- `AUTH_TRUST_HOST=true`
- `DATABASE_URL=<production mysql url>`; add `?sslaccept=strict` if the provider requires secure transport.
- `REDIS_URL=<managed redis tcp/tls url>`
- `MEAL_PLAN_WORKER_SECRET=<random secret>`
- `CRON_SECRET=<different random secret>`
- Existing S3, Razorpay, email, social, web-push, and OAuth variables from the EC2 `.env`.

On Vercel, the Prisma client also adds `sslaccept=strict` automatically for MySQL URLs that do not already include SSL settings. This keeps builds from failing when the database rejects insecure transport.

Optional worker tuning:

- `VERCEL_WORKER_CRON_TIMEOUT_MS=240000`
- `VERCEL_WORKER_CONCURRENCY=1`
- `MEAL_PLAN_WORKER_TIMEOUT_MS=240000`

### Free Scheduler Setup

Create these cron-job.org jobs against the production Vercel domain. Add this request header to every job:

```text
Authorization: Bearer <CRON_SECRET>
```

Recommended jobs:

| Purpose | URL | Schedule |
| --- | --- | --- |
| Process queued meal plans, push jobs, campaigns, and scheduled content | `https://www.kyakhayen.com/api/cron/meal-plan-worker` | Every minute |
| Repair traffic notification schedules | `https://www.kyakhayen.com/api/cron/traffic-sync` | Every 6 hours |
| Repair membership expiry reminders | `https://www.kyakhayen.com/api/cron/expiry-reminders` | Daily |

The worker endpoint processes jobs from Upstash Redis for a bounded window and then exits, which fits Vercel's serverless runtime model.

### Vercel Deployment Checklist

1. Create a managed Redis instance reachable from Vercel and set `REDIS_URL`.
2. Copy all production env vars from EC2 to Vercel, keeping S3 values unchanged.
3. Deploy the app to Vercel.
4. Verify `/api/cron/traffic-sync` with `Authorization: Bearer $CRON_SECRET`.
5. Configure the cron-job.org jobs listed above.
6. Trigger personalization on a test user and confirm `/api/meal-plan/generation/<jobId>` progresses after the next worker tick.
7. Switch DNS to Vercel.
8. After DNS is stable, stop the EC2 services.

Failed scheduler calls are not automatically retried by Vercel. The queue jobs still own retries where BullMQ attempts are configured.

Kyakhayen follows the same AWS + GitHub Actions + PM2 pattern as the KASA site, with two extra production concerns: Prisma/MySQL migrations and the meal-plan background worker.

## Runtime Layout

- AWS host: same instance used by KASA.
- Source/env path: `/opt/kasa/kyakhayen`.
- Release path: `/opt/kasa/kyakhayen-releases/<commit-sha>`.
- Current release symlink: `/opt/kasa/kyakhayen-current`.
- PM2 apps:
  - `kyakhayen-web` on port `3002`
  - `kyakhayen-meal-plan-worker`
- Database backups: `/opt/kasa/backups/kyakhayen-db`

## One-Time Server Setup

```bash
sudo mkdir -p /opt/kasa/kyakhayen /opt/kasa/backups/kyakhayen-db
sudo chown -R ubuntu:ubuntu /opt/kasa/kyakhayen /opt/kasa/backups/kyakhayen-db
cd /opt/kasa/kyakhayen
git clone https://github.com/satendrakanak/kyakhayen.git .
npm ci || npm install
cp env.sample .env
```

Fill `.env` with production values. Keep it only on the server and never commit it.

The server also needs:

- Node.js 22
- PM2
- MySQL client tools (`mysqldump`, `mysql`)
- Redis running and reachable by `REDIS_SERVER_HOST` / `REDIS_SERVER_PORT` for meal-plan jobs

## GitHub Settings

Create the environment `KYAKHAYEN_DEPLOYMENT`.

Required secret:

- `DEPLOY_SSH_KEY`: contents of the existing KASA PEM key, for example:

```bash
cat /path/to/kasa.pem
```

Paste the full output, including the `BEGIN` and `END` lines, into the GitHub environment secret. Do not commit the PEM file.

Optional variables/secrets:

- `DEPLOY_HOST`: defaults to `15.207.104.91`
- `DEPLOY_USER`: defaults to `ubuntu`
- `DEPLOY_PORT`: defaults to `22`
- `DEPLOY_PATH`: defaults to `/opt/kasa/kyakhayen`
- `DEPLOY_RELEASES_DIR`: defaults to `/opt/kasa/kyakhayen-releases`
- `DEPLOY_CURRENT_LINK`: defaults to `/opt/kasa/kyakhayen-current`
- `DEPLOY_HEALTHCHECK_URL`: defaults to `http://127.0.0.1:3002/`
- `DB_BACKUP_DIR`: defaults to `/opt/kasa/backups/kyakhayen-db`
- `DB_BACKUP_RETENTION_DAYS`: defaults to `30`
- `DB_BACKUP_S3_BUCKET`: optional S3 bucket for off-server backups
- `DB_BACKUP_S3_PREFIX`: defaults to `kyakhayen/mysql`
- `DB_BACKUP_S3_REQUIRED`: defaults to `false`; set to `true` only after IAM allows `s3:PutObject`

Useful production variables:

- `NEXT_PUBLIC_APP_URL`: `https://www.kyakhayen.com`
- `NEXT_PUBLIC_SITE_URL`: `https://www.kyakhayen.com`
- `NEXT_PUBLIC_MEDIA_URL`: CloudFront/media base URL
- `NEXT_PUBLIC_RAZORPAY_KEY`: public Razorpay key
- `NEXT_PUBLIC_DEFAULT_COUNTRY`: defaults to `IN`
- `NEXT_PUBLIC_DEFAULT_CURRENCY`: defaults to `INR`
- `NEXT_PUBLIC_EXCHANGE_API_URL`: optional
- `NEXT_PUBLIC_FREE_CURRENCY_API_KEY`: optional
- `NEXT_PUBLIC_GTM_ID`: Google Tag Manager container ID, for example `GTM-N99FLD9B`

Production runtime values live in `/opt/kasa/kyakhayen/.env` on the server and are copied into each release on deploy. The workflow deliberately avoids storing app runtime secrets.

## Deploy Flow

On every push to `master`:

1. GitHub Actions installs dependencies.
2. It gates deploy on strict lint and typecheck.
3. It packages the source without local build output or dependencies.
4. It uploads the release archive to the AWS instance.
5. It extracts the archive into a commit-specific release directory.
6. It copies the server-only `.env` from `DEPLOY_PATH`.
7. It installs production dependencies in the new release directory.
8. It creates a pre-deploy DB backup.
9. It runs `npx prisma migrate deploy`.
10. It builds the Next.js app on the server with the production `.env`.
11. It switches `/opt/kasa/kyakhayen-current` to the new release.
12. It reloads PM2 and runs an internal health check.
13. If the health check fails, it switches the symlink back to the previous release and reloads PM2.

Only the candidate release directory is built; the currently live symlink keeps serving traffic until the health-checked release is ready.

## Database Backup Flow

Backups are created in two ways:

- Before every deploy.
- Every day at `02:00 IST` through `.github/workflows/database-backup.yml`.

The backup script creates compressed dumps:

```bash
npm run backup:db -- manual
```

If `DB_BACKUP_S3_BUCKET` is set, every dump is also uploaded to:

```text
s3://$DB_BACKUP_S3_BUCKET/$DB_BACKUP_S3_PREFIX/
```

Local backups older than `DB_BACKUP_RETENTION_DAYS` are removed automatically.

## Restore Drill

Always restore to a staging database first.

```bash
gunzip -c /opt/kasa/backups/kyakhayen-db/backup-file.sql.gz \
  | mysql -h DB_HOST -u DB_USER -p DB_NAME
```

After a restore, run:

```bash
npx prisma migrate deploy
npm run build
pm2 reload ecosystem.config.cjs --update-env
```

## Nginx

Point the Kyakhayen domain to the PM2 app:

```nginx
location / {
  proxy_pass http://127.0.0.1:3002;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```
