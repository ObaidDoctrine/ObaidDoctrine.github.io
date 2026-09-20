#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${FB_PAGE_ACCESS_TOKEN:-}" ]]; then
  echo "::error::FB_PAGE_ACCESS_TOKEN repository secret is not configured."
  exit 1
fi

BEFORE="${GITHUB_EVENT_BEFORE:-}"
AFTER="${GITHUB_SHA:-}"

if [[ -z "$AFTER" ]]; then
  echo "::error::GITHUB_SHA is missing."
  exit 1
fi

ACCOUNTS_RESPONSE=$(curl --silent --show-error --write-out "\nHTTP_STATUS:%{http_code}" \
  --get \
  --data-urlencode "fields=id,name,tasks,access_token" \
  --data-urlencode "access_token=$FB_PAGE_ACCESS_TOKEN" \
  "https://graph.facebook.com/$FB_GRAPH_VERSION/me/accounts")

ACCOUNTS_STATUS=$(printf '%s' "$ACCOUNTS_RESPONSE" | sed -n 's/^HTTP_STATUS://p' | tail -n 1)
if [[ "$ACCOUNTS_STATUS" != "200" ]]; then
  echo "::error::Could not retrieve Page access token from the stored Meta user token."
  echo "$ACCOUNTS_RESPONSE"
  exit 1
fi

PAGE_ACCESS_TOKEN=$(printf '%s' "$ACCOUNTS_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//' | jq -r --arg page_id "$FB_PAGE_ID" '.data[] | select(.id == $page_id) | .access_token' | head -n 1)

if [[ -z "$PAGE_ACCESS_TOKEN" || "$PAGE_ACCESS_TOKEN" == "null" ]]; then
  echo "::error::The stored Meta token cannot provide a Page access token for Obaid Doctrine."
  exit 1
fi

PERMISSIONS_RESPONSE=$(curl --silent --show-error --get \
  --data-urlencode "access_token=$FB_PAGE_ACCESS_TOKEN" \
  "https://graph.facebook.com/$FB_GRAPH_VERSION/me/permissions")

echo "Meta user token permission check:"
echo "$PERMISSIONS_RESPONSE"

TOKEN_DEBUG=$(curl --silent --show-error --get \
  --data-urlencode "input_token=$PAGE_ACCESS_TOKEN" \
  --data-urlencode "access_token=$FB_PAGE_ACCESS_TOKEN" \
  "https://graph.facebook.com/$FB_GRAPH_VERSION/debug_token")

echo "Derived Page token debug:"
printf '%s' "$TOKEN_DEBUG" | jq '{is_valid:.data.is_valid,type:.data.type,scopes:.data.scopes,granular_scopes:.data.granular_scopes}'

echo "Meta token is valid and a Page access token was obtained for the configured Page."

if [[ "${GITHUB_EVENT_NAME:-}" == "workflow_dispatch" ]]; then
  echo "Manual run: validation only; no Facebook post will be created."
  exit 0
fi

if [[ -z "$BEFORE" || "$BEFORE" == "0000000000000000000000000000000000000000" ]]; then
  FILES=$(git diff-tree --no-commit-id --name-status -r "$AFTER" -- 'articles/**' | awk '$1 == "A" {print $2}')
else
  FILES=$(git diff --name-status "$BEFORE" "$AFTER" -- 'articles/**' | awk '$1 == "A" {print $2}')
fi

if [[ -z "$FILES" ]]; then
  echo "No newly added article files found. Nothing to publish."
  exit 0
fi

while IFS= read -r FILE; do
  [[ -z "$FILE" ]] && continue
  [[ "$FILE" == articles/*/index.html ]] || continue

  TITLE=$(sed -n 's:.*<title>\([^<]*\)</title>.*:\1:p' "$FILE" | head -n 1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  URL=$(grep -i '<link' "$FILE" | grep -i 'rel="canonical"' | sed -n 's/.*href="\([^"]*\)".*/\1/p' | head -n 1)

  if [[ -z "$TITLE" || -z "$URL" ]]; then
    echo "::error::Could not extract title or canonical URL from $FILE"
    exit 1
  fi

  MESSAGE="$TITLE

Read the full article:
$URL

— Obaid Doctrine"

  echo "Publishing: $TITLE"
  RESPONSE=$(curl --silent --show-error --write-out "\nHTTP_STATUS:%{http_code}"     --request POST     --data-urlencode "message=$MESSAGE"     --data-urlencode "access_token=$FB_PAGE_ACCESS_TOKEN"     "https://graph.facebook.com/$FB_GRAPH_VERSION/$FB_PAGE_ID/feed")

  echo "Facebook API response:"
  echo "$RESPONSE"

  if [[ "$RESPONSE" != *"HTTP_STATUS:200"* ]]; then
    echo "::error::Facebook API did not return HTTP 200."
    exit 1
  fi

  echo "Published successfully: $URL"
done <<< "$FILES"
