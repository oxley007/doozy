#!/bin/bash
set -e

# Only run during Archive builds
if [ "$ACTION" != "install" ]; then
  echo "ℹ️ Skipping Hermes dSYM generation: not an Archive build."
  exit 0
fi

# Colors for Xcode logs
GREEN="\033[0;32m"
RED="\033[0;31m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RESET="\033[0m"

echo -e "${CYAN}🚀 Starting Hermes dSYM generation...${RESET}"

# Auto-detect xcarchive if not explicitly set
ARCHIVE_DIR=${ARCHIVE_PATH:-$(ls -dt ~/Library/Developer/Xcode/Archives/*/*.xcarchive 2>/dev/null | head -n1)}
if [ -z "$ARCHIVE_DIR" ]; then
  echo -e "${YELLOW}⚠️ No xcarchive found, skipping Hermes dSYM generation.${RESET}"
  exit 0
fi

echo "ℹ️ Using archive: $ARCHIVE_DIR"

# Auto-detect Hermes binary
HERMES_BIN=$(find "$ARCHIVE_DIR/Products/Applications/$PRODUCT_NAME.app/" -name hermes -type f | head -n 1)
if [ -z "$HERMES_BIN" ]; then
  echo -e "${YELLOW}⚠️ Hermes binary not found. Skipping dSYM generation.${RESET}"
  exit 0
fi

echo "ℹ️ Hermes binary detected at: $HERMES_BIN"

# Prepare output folder
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
OUTPUT_DIR="$SRCROOT/../hermes-dsyms-${DATE}"
mkdir -p "$OUTPUT_DIR"

# Generate Hermes dSYM
dsymutil "$HERMES_BIN" -o "$OUTPUT_DIR/hermes.framework.dSYM"
echo -e "${GREEN}✅ Hermes dSYM generated in $OUTPUT_DIR${RESET}"

# Upload to Crashlytics
UPLOAD_SCRIPT="./ios/Pods/FirebaseCrashlytics/upload-symbols"
GSP_FILE="ios/GoogleService-Info.plist"

if [ -f "$UPLOAD_SCRIPT" ] && [ -f "$GSP_FILE" ]; then
  echo -e "${CYAN}📤 Uploading Hermes dSYMs to Crashlytics...${RESET}"
  if "$UPLOAD_SCRIPT" -gsp "$GSP_FILE" -p ios "$OUTPUT_DIR/hermes.framework.dSYM"; then
    echo -e "${GREEN}✅ Successfully uploaded Hermes dSYMs to Crashlytics${RESET}"
  else
    echo -e "${RED}❌ Failed to upload Hermes dSYMs to Crashlytics${RESET}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️ upload-symbols script or GoogleService-Info.plist not found, skipping upload.${RESET}"
fi

# 🧹 Clean up old hermes-dsyms-* folders (keep last 5)
MAX_FOLDERS=5
DSYM_FOLDERS=( $(ls -dt "$SRCROOT/../hermes-dsyms-"* 2>/dev/null || true) )

if [ ${#DSYM_FOLDERS[@]} -gt $MAX_FOLDERS ]; then
  echo -e "${CYAN}🧹 Cleaning up old Hermes dSYM folders...${RESET}"
  for folder in "${DSYM_FOLDERS[@]:$MAX_FOLDERS}"; do
    rm -rf "$folder"
    echo "   Removed $folder"
  done
fi

echo -e "${GREEN}🎉 Hermes dSYM process completed successfully!${RESET}"
