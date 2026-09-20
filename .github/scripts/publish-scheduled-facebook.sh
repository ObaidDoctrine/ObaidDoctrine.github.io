#!/usr/bin/env bash
set -euo pipefail
QUEUE="automation/facebook-queue.json"
if [[ ! -f "$QUEUE" ]]; then echo "::error::Facebook queue not found: $QUEUE"; exit 1; fi
if [[ -z "${FB_PAGE_ACCESS_TOKEN:-}" ]]; then echo "::error::FB_PAGE_ACCESS_TOKEN repository secret is not configured."; exit 1; fi
ACCOUNTS_RESPONSE=$(curl --silent --show-error --write-out "\nHTTP_STATUS:%{http_code}" --get --data-urlencode "fields=id,name,tasks,access_token" --data-urlencode "access_token=$FB_PAGE_ACCESS_TOKEN" "https://graph.facebook.com/$FB_GRAPH_VERSION/me/accounts")
STATUS=$(printf '%s' "$ACCOUNTS_RESPONSE" | sed -n 's/^HTTP_STATUS://p' | tail -n 1)
if [[ "$STATUS" != "200" ]]; then echo "::error::Could not retrieve Page access token."; exit 1; fi
PAGE_ACCESS_TOKEN=$(printf '%s' "$ACCOUNTS_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//' | jq -r --arg page_id "$FB_PAGE_ID" '.data[] | select(.id == $page_id) | .access_token' | head -n 1)
if [[ -z "$PAGE_ACCESS_TOKEN" || "$PAGE_ACCESS_TOKEN" == "null" ]]; then echo "::error::Stored Meta token cannot provide the configured Page access token."; exit 1; fi
NOW_UTC=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DUE=$(jq -c --arg now "$NOW_UTC" '[ .[] | select(.status == "pending" and .publish_at_utc <= $now) ]' "$QUEUE")
COUNT=$(printf '%s' "$DUE" | jq 'length')
echo "Scheduler check: $NOW_UTC; due items: $COUNT"
if [[ "$COUNT" -eq 0 ]]; then exit 0; fi
printf '%s' "$DUE" | jq -c '.[]' | while IFS= read -r ITEM; do
  ID=$(printf '%s' "$ITEM" | jq -r '.id')
  MESSAGE=$(printf '%s' "$ITEM" | jq -r '.message')
  URL=$(printf '%s' "$ITEM" | jq -r '.canonical_url // empty')
  if [[ -n "$URL" ]]; then MESSAGE="$MESSAGE"$'\n\n'"$URL"; fi
  RESPONSE=$(curl --silent --show-error --write-out "\nHTTP_STATUS:%{http_code}" --request POST --data-urlencode "message=$MESSAGE" --data-urlencode "access_token=$PAGE_ACCESS_TOKEN" "https://graph.facebook.com/$FB_GRAPH_VERSION/$FB_PAGE_ID/feed")
  echo "$ID: $RESPONSE"
  if [[ "$RESPONSE" != *"HTTP_STATUS:200"* ]]; then echo "::error::Facebook API failed for $ID"; exit 1; fi
done
