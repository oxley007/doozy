#!/bin/bash
set -e

# -----------------------------
# CONFIG: Update these paths
# -----------------------------
ARCHIVE_PATH="$1"  # Pass full path to your .xcarchive as first argument
GSP_PATH="./ios/GoogleService-Info.plist"  # Path to your GoogleService-Info.plist
TMP_DIR="./tmp_hermes"                       # Temporary working folder

if [ -z "$ARCHIVE_PATH" ]; then
  echo "Usage: $0 /path/to/YourApp.xcarchive"
  exit 1
fi

# Extract timestamp for folder naming
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
OUTPUT_DIR="./hermes-dsyms-$TIMESTAMP"
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TMP_DIR"

# Locate Hermes binary inside archive
HERMES_BINARY="$ARCHIVE_PATH/Products/Applications/DoozyApp.app/hermes"

if [ ! -f "$HERMES_BINARY" ]; then
  echo "Hermes binary not found at: $HERMES_BINARY"
  exit 1
fi

# Copy Hermes binary to temporary writable folder
cp "$HERMES_BINARY" "$TMP_DIR/hermes"

# Generate dSYM
dsymutil "$TMP_DIR/hermes" -o "$OUTPUT_DIR/hermes.framework.dSYM"

# Upload to Firebase Crashlytics
if [ ! -f "$GSP_PATH" ]; then
  echo "GoogleService-Info.plist not found at $GSP_PATH"
  exit 1
fi

echo "Uploading Hermes dSYM to Firebase Crashlytics..."
./ios/Pods/FirebaseCrashlytics/upload-symbols -gsp "$GSP_PATH" -p ios "$OUTPUT_DIR/hermes.framework.dSYM"

echo "Hermes dSYM generated and uploaded successfully!"
echo "Output folder: $OUTPUT_DIR"

# Cleanup temporary folder
rm -rf "$TMP_DIR"
