#!/bin/sh

# Replace environment variables in the config file
cat <<EOF > /usr/share/nginx/html/assets/environment.json
{
	"firebaseConfig": {
		"apiKey": "$FIREBASE_API_KEY",
		"authDomain": "$FIREBASE_AUTH_DOMAIN",
		"projectId": "$FIREBASE_PROJECT_ID",
		"storageBucket": "$FIREBASE_STORAGE_BUCKET",
		"messagingSenderId": "$FIREBASE_MESSAGING_SENDER_ID",
		"appId": "$FIREBASE_APP_ID",
		"measurementId": "$FIREBASE_MEASUREMENT_ID"
	}
}
EOF

# Start Nginx
nginx -g 'daemon off;'
