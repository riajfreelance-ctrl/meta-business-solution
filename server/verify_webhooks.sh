#!/bin/bash

# Configuration
PAGE_ID="963307416870090"
API_URL="http://localhost:3000/api/webhook"

echo "=== Testing Inbox Message Webhook ==="
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [
      {
        "id": "'$PAGE_ID'",
        "time": '$(date +%s)',
        "messaging": [
          {
            "sender": { "id": "TEST_USER_PSID" },
            "recipient": { "id": "'$PAGE_ID'" },
            "timestamp": '$(date +%s)',
            "message": { "text": "price?" }
          }
        ]
      }
    ]
  }'

echo -e "\n\n=== Testing Comment Webhook ==="
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [
      {
        "id": "'$PAGE_ID'",
        "time": '$(date +%s)',
        "changes": [
          {
            "field": "feed",
            "value": {
              "item": "comment",
              "verb": "add",
              "comment_id": "TEST_COMMENT_ID_123",
              "post_id": "TEST_POST_ID_456",
              "from": { "id": "TEST_USER_PSID", "name": "Test User" },
              "message": "ei product er dam koto?"
            }
          }
        ]
      }
    ]
  }'

echo -e "\n\n=== Verification Complete ===\nCheck server logs for output."
