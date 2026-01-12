#!/bin/sh
cd /home/site/wwwroot

# Verify BUILD_ID exists, if not create it from server.js location
if [ ! -f ".next/BUILD_ID" ]; then
  echo "WARNING: BUILD_ID not found, checking structure..."
  ls -la
  ls -la .next/ 2>/dev/null || echo ".next directory missing"
  
  # Try to find BUILD_ID in parent or create a default
  if [ -f "../.next/BUILD_ID" ]; then
    cp ../.next/BUILD_ID .next/BUILD_ID
    echo "Copied BUILD_ID from parent"
  else
    echo "Creating default BUILD_ID"
    mkdir -p .next
    echo "default" > .next/BUILD_ID
  fi
fi

# Verify server.js exists
if [ ! -f "server.js" ]; then
  echo "ERROR: server.js not found!"
  exit 1
fi

echo "Starting Next.js server..."
node server.js
