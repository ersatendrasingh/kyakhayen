# AWS Storage Setup

## Architecture

Use two separate private S3 buckets:

- `kyakhayen-media-<env>`: recipe images, videos, profile pictures, article images, and shared email/notification assets.
- `kyakhayen-private-<env>`: generated user meal-plan JSON under `usersMealPlans/`.

Only the media bucket should be connected to CloudFront. The private-data bucket must never be a CloudFront origin or public website bucket.

## AWS Console Setup

1. Create both buckets in the same region used by the application, for example `ap-south-1`.
2. Keep **Block all public access** enabled on both buckets.
3. Keep server-side encryption enabled on both buckets.
4. Create a CloudFront distribution for the media bucket only.
5. Set the S3 origin access method to **Origin Access Control (OAC)** and let CloudFront add or supply the bucket policy that grants only that distribution read access.
6. Add a custom domain such as `media.kyakhayen.com` later, or initially use the CloudFront distribution domain as `NEXT_PUBLIC_MEDIA_URL`.
7. Upload shared assets such as `others/kya-khayen-favicon.png` and all `others/*` email images into the media bucket before testing email or notifications.

## Browser Upload CORS

Media uploads use short-lived presigned URLs so the browser uploads directly to the private media bucket. Open `kyakhayen-media-prod` in S3, then **Permissions** > **Cross-origin resource sharing (CORS)** > **Edit**, and save:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Before production launch, add the exact production website origin to `AllowedOrigins`, for example `https://www.kyakhayen.com`. Do not use `*` for production origins.

The repository can save this configuration from the app environment. Add production
origins when deploying:

```bash
npm run storage:cors -- --apply
npm run storage:cors -- --apply --origin=https://www.kyakhayen.com
```

Images use direct presigned uploads. Videos use presigned multipart uploads so large
files are uploaded in resumable-sized S3 parts instead of passing through Next.js.
`ExposeHeaders: ["ETag"]` is required to complete multipart uploads in the browser.

## Application Credentials

Create a server-only IAM user or deployment role with permissions scoped to these two buckets. Do not expose the keys to browser code.

The application needs:

- Media bucket: `s3:PutObject`, `s3:AbortMultipartUpload`, `s3:DeleteObject`, and `s3:ListBucket`.
- Private bucket application data: `s3:PutObject` and `s3:GetObject` under `usersMealPlans/`.
- Private bucket verification: `s3:PutObject` and `s3:DeleteObject` only under `_healthchecks/`.

Use an IAM policy shaped like this after replacing the bucket names:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MediaObjectWrites",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:AbortMultipartUpload", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::kyakhayen-media-prod/*"
    },
    {
      "Sid": "MediaListForFolderCleanup",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::kyakhayen-media-prod"
    },
    {
      "Sid": "PrivateMealPlans",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::kyakhayen-private-prod/usersMealPlans/*"
    },
    {
      "Sid": "PrivateStorageVerification",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::kyakhayen-private-prod/_healthchecks/*"
    }
  ]
}
```

## Environment Values

Set these locally in `.env`; never commit actual keys:

```bash
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_MEDIA_BUCKET_NAME=kyakhayen-media-prod
AWS_PRIVATE_BUCKET_NAME=kyakhayen-private-prod
NEXT_PUBLIC_MEDIA_URL=https://your-cloudfront-domain.example
```

## Verification

After entering credentials and bucket names:

```bash
npm run storage:verify
```

This command uploads and immediately deletes a small health-check object in each bucket. It verifies that application write/delete permissions are correct without retaining test data.

## Allergy Catalog Import

The legacy `8well` allergy catalog and prepared local `.webp` assets are imported
through a dedicated ETL script, rather than general application seeding:

```bash
# Optional overrides when the legacy database or image folder is elsewhere:
SOURCE_8WELL_DATABASE_URL=
ALLERGY_IMAGE_SOURCE_DIR=/absolute/path/to/tags-image/allergies

npm run import:allergies:dry-run
npm run import:allergies
```

The dry run validates source rows, image filename matching, and removable legacy
placeholder records. The apply command upserts taxonomy rows, uploads each image
under `allergies/{id}/` in the public media bucket, stores CloudFront URLs, and
removes only unused legacy placeholder values.

## Ingredient Catalog Import

Ingredients are migrated as a nutrition catalog, along with their categories,
food units, gram conversion measurements, and recipe form vocabulary:

```bash
npm run import:ingredients:dry-run
npm run import:ingredients
```

Only active legacy ingredients are considered. NIN and USDA sourced nutrition
rows are eligible for publication after validation; uncertain manually entered
legacy rows remain drafts for editorial review. NIN micronutrient storage units
are converted to the display units used by this application, and every imported
ingredient receives a `Gram = 1` measurement so recipe nutrition calculations
are consistently based on per-100-gram values.

## Migration Note

Existing database records can still contain old direct S3 asset URLs, so they remain display-compatible during migration. Once stored records use the CloudFront URL, remove the legacy S3 hosts from `next.config.mjs`.
