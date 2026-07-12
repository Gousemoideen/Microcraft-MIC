# Workshop Certificate Generation & Upload Instructions

This guide outlines the steps to validate participants, generate PDF certificates from the template, upload them to Cloudinary, and synchronize the links to MongoDB.

---

## Prerequisites

1. **Environment Variables**:
   Ensure `.env.local` in the root directory contains the correct MongoDB and Cloudinary credentials:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

2. **Required Assets**:
   - **Template**: Place the certificate background image in `public/templates/Google.jpg`.
   - **Fonts**: Make sure the TrueType fonts are located in `public/fonts/` (specifically `NotoSans-Regular.ttf` and `NotoSansTamil-Regular.ttf`).
   - **Participants CSV**: Make sure the target spreadsheet is saved at the root as `participants.csv` with the following headers:
     `name,email,event_name,event_code,event_type,date`

---

## Execution Steps

Run the following scripts sequentially from the project root:

### Step 1: Validate CSV & Generate IDs
Reads `participants.csv`, validates columns/dates, detects duplicate entries, generates sequence-padded `cert_id`s (e.g. `MC26-WS01-0001`), and outputs the clean list.
```bash
node scripts/certificate-system/1-validate-participants.mjs
```
*Output: Generates `validated_participants.csv`.*

### Step 2: Generate PDF Certificates
Reads `validated_participants.csv`, loads the `Google.jpg` template, overlays text details (name, event, date, signature, venue) directly onto the coordinate-aligned lines, generates verification QR codes, and builds landscape PDFs.
```bash
node scripts/certificate-system/2-generate-pdfs.mjs
```
*Outputs: Generates PDFs in `output/` and copies them to `public/certificates/` for local previewing.*

### Step 3: Upload to Cloudinary & Sync MongoDB
Connects to MongoDB and uploads the generated PDFs to Cloudinary under folder `microcraft-certs` as `image` resource types (enabling browser-native PDF previewing). Then, upserts the record into the database.
```bash
node scripts/certificate-system/3-upload-certificates.mjs
```

---

## Useful Command Flags & Testing

### Force Re-upload (Database Overwrite)
By default, the uploader is idempotent and will skip certificates already synced. To force-overwrite existing DB records and re-upload files:
```bash
node scripts/certificate-system/3-upload-certificates.mjs --force
```

### Local Offline Testing (Mock Mode)
To test the pipeline offline without actual Cloudinary uploads, run the uploader with the `--mock` flag. This will save local static paths (`/certificates/{cert_id}.pdf`) to the database so you can preview files on `localhost`:
```bash
node scripts/certificate-system/3-upload-certificates.mjs --force --mock
```

---

## Troubleshooting

- **401 Unauthorized from Cloudinary**: If the generated PDF link returns a 401, log into your Cloudinary Dashboard, go to **Settings** -> **Security** -> **Restricted Media Types**, and uncheck **PDF** (or enable **PDF and ZIP files delivery**).
- **Stale Dynamic Types**: If Next.js server fails to compile due to route parameter types, clear the build cache and check using:
  ```bash
  rm -rf .next && npx tsc --noEmit
  ```
