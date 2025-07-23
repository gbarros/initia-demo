#!/bin/bash

# PRIVATE_KEY= forge script script/DeployToAnvil.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
PRIVATE_KEY= forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --legacy
