#!/bin/bash

# Script to query Ethereum node for chain ID and set as environment variable
# Usage: ./set-chain-id.sh [command to run]

# Default RPC URL
RPC_URL=${RPC_URL:-http://localhost:8590}

# Function to convert hex to decimal
hex_to_decimal() {
  # Remove 0x prefix if present
  local hex=${1#0x}
  # Use printf to convert hex to decimal
  printf "%d\n" "0x$hex" 2>/dev/null
}

# Function to check if jq is available
has_jq() {
  command -v jq >/dev/null 2>&1
}

echo "Querying node at $RPC_URL for chain ID..."

# Make the JSON-RPC request using curl
response=$(curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  $RPC_URL)

# Check if the request was successful
if [ -z "$response" ]; then
  echo "Error: No response from Ethereum node at $RPC_URL"
  echo "Please make sure the node is running and accessible."
  exit 1
fi

# Extract the chain ID from the response
if has_jq; then
  # Use jq if available (cleaner JSON parsing)
  chain_id_hex=$(echo $response | jq -r '.result')
  error=$(echo $response | jq -r '.error.message // empty')
  
  if [ ! -z "$error" ]; then
    echo "RPC Error: $error"
    exit 1
  fi
else
  # Fallback to grep/sed if jq not available
  if echo $response | grep -q '"error"'; then
    echo "RPC Error detected. Response: $response"
    exit 1
  fi
  
  # Extract the result field with hex chain ID
  chain_id_hex=$(echo $response | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')
fi

# Validate we got a hex chain ID
if [ -z "$chain_id_hex" ] || [[ ! "$chain_id_hex" =~ ^0x ]]; then
  echo "Error: Invalid chain ID received: $chain_id_hex"
  echo "Response was: $response"
  exit 1
fi

# Convert the hex chain ID to decimal
chain_id_dec=$(hex_to_decimal "$chain_id_hex")

# Check if conversion was successful
if [ -z "$chain_id_dec" ]; then
  echo "Error: Could not convert hex chain ID $chain_id_hex to decimal"
  exit 1
fi

# Export the chain ID as environment variable
export CHAIN_ID="$chain_id_dec"

# Print for verification
echo "Using Chain ID: $CHAIN_ID (hex: $chain_id_hex)"

# Pass control to the next command with environment variables intact
if [ $# -gt 0 ]; then
  exec "$@"
fi
