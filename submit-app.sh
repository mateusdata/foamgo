#!/bin/bash

source .env.local

[ ! -f "$APP_STORE_CONNECT_API_KEY_KEY_FILEPATH" ] && echo "Error: .p8 not found" && exit 1

echo "Building..."
eas build --local -p ios --non-interactive

LATEST_IPA=$(ls -t *.ipa 2>/dev/null | head -n 1)
[ -z "$LATEST_IPA" ] && echo "Error: no .ipa found" && exit 1

echo "Uploading: $LATEST_IPA"

API_KEY_FILE="/tmp/api_key_$$.json"
KEY_CONTENT=$(cat "$APP_STORE_CONNECT_API_KEY_KEY_FILEPATH" | tr '\n' ' ' | sed 's/  */ /g' | sed 's/-----BEGIN PRIVATE KEY-----/-----BEGIN PRIVATE KEY-----\\n/g' | sed 's/-----END PRIVATE KEY-----/\\n-----END PRIVATE KEY-----/g')

cat > "$API_KEY_FILE" <<EOF
{"key_id":"$APP_STORE_CONNECT_API_KEY_KEY_ID","issuer_id":"$APP_STORE_CONNECT_API_KEY_ISSUER_ID","key":"$KEY_CONTENT","duration":1200,"in_house":$APP_STORE_CONNECT_API_KEY_IN_HOUSE}
EOF

fastlane pilot upload \
  --api_key_path "$API_KEY_FILE" \
  --ipa "$LATEST_IPA" \
  --skip_waiting_for_build_processing true

UPLOAD_STATUS=$?
rm -f "$API_KEY_FILE"

if [ $UPLOAD_STATUS -eq 0 ]; then
  echo "Upload successful, deleting $LATEST_IPA..."
  rm -f "$LATEST_IPA"
  echo "Done!"
else
  echo "Upload failed, .ipa kept."
fi