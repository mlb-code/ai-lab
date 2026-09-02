#!/bin/bash
cd "$(dirname "$0")"
lsof -ti :5502 | xargs kill 2>/dev/null
sleep 1
node dev-server.mjs
