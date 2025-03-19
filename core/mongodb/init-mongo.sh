#!/bin/sh

mongod --replSet rs0 --bind_ip_all --port 27017 &

# Wait for MongoDB to start
sleep 1

# Initialize the replica set
mongosh --port 27017 --quiet --eval "try { rs.status() } catch (err) { rs.initiate({_id: \"rs0\", members: [{_id: 0, host: \"core_mongodb:27017\"}]}) }"

# Wait for replica set to stabilize
sleep 1

# Execute the JavaScript initialization file
mongosh --port 27017 --file /init-mongo.js

wait
