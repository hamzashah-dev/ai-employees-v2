#!/usr/bin/env bash
#
# Run the whole stack: a local Hermes dashboard + this app's Vite dev server.
#
#   ./run-local.sh                 # backend :9129, frontend :5190
#   ./run-local.sh 5190 9129       # explicit ports
#
# Why this exists, and why each check below is not paranoia:
#
#   1. The backend must be `computer dashboard`, NOT `computer serve`.
#      vite.config.ts scrapes `window.__COMPUTER_SESSION_TOKEN__` out of the
#      HTML the backend serves at `/`. `serve` is the headless backend — it
#      never serves the SPA, so the scrape finds nothing and every protected
#      /api/* call 401s. The failure looks like an auth bug, not a wrong-command
#      bug, which is why it is worth a hard check.
#
#   2. Port alone is not readiness. The dashboard opens its socket before the
#      SPA is ready, so we wait for the TOKEN to appear, which is the thing the
#      frontend actually needs.
#
#   3. More than one Hermes install runs on this machine. Talking to the wrong
#      one fails SILENTLY — you get another checkout's roster rather than an
#      error. Every port check below reports `computer_home` so a mismatch is
#      visible, and VITE_HERMES_COMPUTER_HOME turns it into a startup failure.
#
set -euo pipefail

FE_PORT="${1:-5190}"
BE_PORT="${2:-9129}"

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="${CLOUD_COMPUTER_REPO:-$(cd "$HERE/../cloud-computer" 2>/dev/null && pwd || true)}"

die() { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }
note() { printf '\033[2m%s\033[0m\n' "$*"; }

[ -n "$REPO" ] && [ -d "$REPO/.computer" ] \
  || die "no cloud-computer checkout with a .computer/ beside this one.
       Set CLOUD_COMPUTER_REPO to its path."

HOME_DIR="$REPO/.computer"

# ── pre-flight ───────────────────────────────────────────────────────────────
[ -d "$HERE/node_modules" ] \
  || die "node_modules is missing. Run 'npm ci' first (this script does not
       install dependencies for you)."

grep -qE '^OPENROUTER_API_KEY=.+' "$HOME_DIR/.env" 2>/dev/null \
  || die "no OPENROUTER_API_KEY in $HOME_DIR/.env — agents cannot run without a
       model key. Copy the line from $REPO/.env, then: chmod 600 $HOME_DIR/.env"

# Report who owns a port, and which install it is. `computer_home` is the only
# reliable way to tell two Hermes checkouts apart.
port_owner() { lsof -nP -iTCP:"$1" -sTCP:LISTEN 2>/dev/null | tail -n +2; }
home_at() {
  curl -sf -m 3 "http://127.0.0.1:$1/api/status" 2>/dev/null \
    | python3 -c 'import sys,json;print(json.load(sys.stdin).get("computer_home",""))' 2>/dev/null || true
}
# Returns 0 (success) when the backend serves a session token.
#
# Uses grep -q, not grep -c. `grep -c` PRINTS "0" and then exits 1 on no match,
# so `$(grep -c … || echo 0)` produces the two-line string "0\n0", which never
# compares equal to "0" — the check inverts and reports a token that is not
# there. That would let the app start against a headless `computer serve` and
# 401 on every call, which is the precise failure this guard exists to catch.
has_token() {
  curl -sf -m 3 -H 'accept: text/html' "http://127.0.0.1:$1/" 2>/dev/null \
    | grep -q '__COMPUTER_SESSION_TOKEN__'
}

if [ -n "$(port_owner "$FE_PORT")" ]; then
  port_owner "$FE_PORT" >&2
  die "port $FE_PORT (frontend) is already in use — stop it, or pass other ports:
       ./run-local.sh <fe> <be>"
fi

STARTED_BACKEND=""
if [ -n "$(port_owner "$BE_PORT")" ]; then
  # Something is already there. Reuse it only if it is the right install AND it
  # actually serves the token — i.e. it is a dashboard, not a headless `serve`.
  EXISTING_HOME="$(home_at "$BE_PORT")"
  [ "$EXISTING_HOME" = "$HOME_DIR" ] || {
    port_owner "$BE_PORT" >&2
    die "port $BE_PORT is held by a DIFFERENT Hermes install:
         running:  ${EXISTING_HOME:-<not a Hermes backend>}
         expected: $HOME_DIR
       Pointing the app at it would silently show you that checkout's roster."
  }
  has_token "$BE_PORT" || die \
"a backend is already on $BE_PORT for the right home, but it serves no session
       token — that means it is 'computer serve' (headless), not 'computer
       dashboard'. Vite scrapes the token out of the dashboard's HTML, so every
       /api call would 401. Stop it and re-run this script, which starts the
       dashboard instead."
  note "reusing the dashboard already on :$BE_PORT"
else
  note "starting the dashboard on :$BE_PORT  ($HOME_DIR)"
  note "first run builds the web UI from $REPO/web — this can take a few minutes"
  ( cd "$REPO" && COMPUTER_HOME="$HOME_DIR" exec uv run computer dashboard --port "$BE_PORT" ) \
    >/tmp/hermes-dashboard.$BE_PORT.log 2>&1 &
  STARTED_BACKEND=$!
fi

cleanup() { [ -n "$STARTED_BACKEND" ] && kill "$STARTED_BACKEND" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

# ── wait for the TOKEN, not merely the port ──────────────────────────────────
if [ -n "$STARTED_BACKEND" ]; then
  printf 'waiting for the dashboard'
  for _ in $(seq 1 180); do
    if has_token "$BE_PORT"; then printf '\n'; break; fi
    kill -0 "$STARTED_BACKEND" 2>/dev/null || {
      printf '\n'; tail -20 "/tmp/hermes-dashboard.$BE_PORT.log" >&2
      die "the dashboard exited during startup — log above, full log at
       /tmp/hermes-dashboard.$BE_PORT.log"
    }
    printf '.'; sleep 2
  done
  has_token "$BE_PORT" || die \
"the dashboard never served a session token (waited 6 minutes).
       See /tmp/hermes-dashboard.$BE_PORT.log"
fi

ACTUAL_HOME="$(home_at "$BE_PORT")"
[ "$ACTUAL_HOME" = "$HOME_DIR" ] || die "backend reports the wrong COMPUTER_HOME:
         got:      ${ACTUAL_HOME:-<none>}
         expected: $HOME_DIR"

printf '\033[32mbackend\033[0m   http://127.0.0.1:%s   %s\n' "$BE_PORT" "$HOME_DIR"
printf '\033[32mfrontend\033[0m  http://127.0.0.1:%s\n' "$FE_PORT"
printf '\033[32mauth\033[0m      session token is being served\n\n'

# VITE_HERMES_COMPUTER_HOME makes vite.config.ts abort on a mismatch rather than
# quietly rendering the wrong install's roster.
cd "$HERE"
export VITE_HERMES_URL="http://127.0.0.1:$BE_PORT"
export VITE_HERMES_COMPUTER_HOME="$HOME_DIR"
exec npm run dev -- --port "$FE_PORT" --strictPort
