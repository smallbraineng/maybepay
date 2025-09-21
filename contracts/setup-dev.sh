#!/bin/bash

# Development environment setup script for MaybePay contracts

set -e

echo "🚀 Starting development environment setup..."

# Start anvil in background
echo "🔧 Starting Anvil..."
anvil &
ANVIL_PID=$!

# Wait for anvil to be ready
echo "⏳ Waiting for Anvil to start..."
sleep 3

# Deploy contracts
echo "📦 Deploying contracts..."
DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol:DeployMaybePay --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast 2>&1)

# Extract contract address from deploy output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "MaybePay deployed at:" | awk '{print $4}')

echo ""
echo "✅ Development environment ready!"
echo ""
echo "📄 Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "🔑 Default Anvil Account:"
echo "Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo "Address:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo ""
echo "🌐 RPC URL: http://localhost:8545"
echo "💰 Balance: 10000 ETH"
echo ""
echo "To stop Anvil, run: kill $ANVIL_PID"
echo "Or use: pkill -f anvil"