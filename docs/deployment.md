# Kyakhayen Deployment

Kyakhayen follows the same AWS + GitHub Actions + PM2 pattern as the KASA site, with two extra production concerns: Prisma/MySQL migrations and background workers.

## Runtime Layout

- AWS host: same instance used by KASA.
- Source/env path: `/opt/kasa/kyakhayen`.
- Release path: `/opt/kasa/kyakhayen-releases/<commit-sha>`.
- Current release symlink: `/opt/kasa/kyakhayen-current`.
- PM2 apps:
  - `kyakhayen-web` on port `3002`
  - `kyakhayen-meal-plan-worker`
  - `kyakhayen-recipe-view-worker`
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
- Redis running and reachable by `REDIS_SERVER_HOST` / `REDIS_SERVER_PORT`

## GitHub Settings

Create the environment `KYAKHAYEN_DEPLOYMENT`.

Required secret:

- `DEPLOY_SSH_KEY`: contents of the existing KASA PEM key, for example:

```bash
cat /path/to/kasa.pem
```

Paste the full output, including the `BEGIN` and `END` lines, into the GitHub environment secret. Do not commit the PEM file.

Optional variables/secrets:

- `DEPLOY_HOST`: defaults to `13.206.210.16`
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

Because production builds run on GitHub Actions, public `NEXT_PUBLIC_*` values must be available to the workflow as repository or environment variables/secrets. Server-only values still live in `/opt/kasa/kyakhayen/.env` and are copied into each release on deploy.

## Deploy Flow

On every push to `master`:

1. GitHub Actions installs dependencies.
2. It gates deploy on strict lint, typecheck, and a production build on the GitHub runner.
3. It packages the built `.next` output without `.next/cache` or `.next/dev`.
4. It uploads the release archive to the AWS instance.
5. It extracts the archive into a commit-specific release directory.
6. It copies the server-only `.env` from `DEPLOY_PATH`.
7. It installs production dependencies in the new release directory.
8. It creates a pre-deploy DB backup.
9. It runs `npx prisma migrate deploy`.
10. It switches `/opt/kasa/kyakhayen-current` to the new release.
11. It reloads PM2 and runs an internal health check.
12. If the health check fails, it switches the symlink back to the previous release and reloads PM2.

The live server does not run `next build`; builds happen on GitHub Actions to avoid taking down the shared instance.

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
