# Firebase Service Account Setup

## Important Security Notice

The Firebase service account file (`services/firebase-service-account.json`) contains sensitive credentials and is **NOT** tracked in Git for security reasons.

## Setup Instructions

1. **Get your Firebase service account file** from the Firebase Console
   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Place the file in the services directory**
   ```bash
   # Copy your downloaded file to the services directory
   cp /path/to/your/downloaded-file.json services/firebase-service-account.json
   ```

3. **Verify the setup**
   - The file should exist locally: `services/firebase-service-account.json`
   - The file should NOT be tracked by Git (check with `git status`)
   - The template file shows the expected structure

## Template Reference

Use `services/firebase-service-account.json.template` as a reference for the expected JSON structure.

## Security Best Practices

- ✅ The file is in `.gitignore` and won't be pushed to GitHub
- ✅ Only the template (without real credentials) is tracked
- ✅ Your local Firebase functionality will work correctly
- ❌ Never commit real credentials to version control
- ❌ Never share the service account file publicly

## Troubleshooting

If Firebase features don't work:
1. Verify the file exists: `dir services/firebase-service-account.json`
2. Check file permissions
3. Ensure the JSON format is valid
4. Verify the credentials are active in Firebase Console
