#!/bin/bash

# Build the client
cd client
npm install
npm run build
cd ..

# Build the server
cd server
npm install
cd ..

# Copy the client build to the server
cp -r client/dist/public server/dist/public
