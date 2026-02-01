#!/bin/bash
set -e
npx prisma generate
npx prisma migrate deploy || true
node src/index.js
