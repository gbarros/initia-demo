#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Get chain ID from environment variable or fallback to anvil's default
const chainId = process.env.CHAIN_ID || '31337';

console.log(`Generating contract info for chain ID: ${chainId}`);

// Function to find the latest deployment file
function findLatestDeployment() {
    let deploymentPath;
    
    if (chainId === '31337') {
        // Anvil environment - use DeployToAnvil.s.sol
        deploymentPath = path.resolve(
            process.cwd(),
            '../contracts/broadcast/DeployToAnvil.s.sol',
            chainId,
            'run-latest.json'
        );
        
        if (!fs.existsSync(deploymentPath)) {
            console.warn(`Anvil deployment not found at ${deploymentPath}. Using placeholder address.`);
            return { transactions: [] };
        }
    } else {
        // Non-Anvil environment - use Deploy.s.sol
        deploymentPath = path.resolve(
            process.cwd(),
            '../contracts/broadcast/Deploy.s.sol',
            chainId,
            'run-latest.json'
        );
        
        if (!fs.existsSync(deploymentPath)) {
            console.warn(`Network deployment not found for chain ID ${chainId}. Using placeholder address.`);
            return { transactions: [] };
        }
    }
    
    return require(deploymentPath);
}

// Get ABI from compiled contract
let abiPath = path.resolve(process.cwd(), '../contracts/out/CampMamoTShirt.sol/CampMamoTShirt.json');
let contractAbi;

try {
    contractAbi = require(abiPath).abi;
} catch (error) {
    console.warn('Could not find CampMamoTShirt ABI. Using empty ABI.');
    contractAbi = [];
}

// Get the deployment data
const deployment = findLatestDeployment();

// Find the transaction that deployed the CampMamoTShirt contract
const tshirtContractDeployment = deployment.transactions.find(
    (tx) => tx.contractName === 'CampMamoTShirt'
);

// Determine contract address
let contractAddress = '0x0000000000000000000000000000000000000000'; // Placeholder address

if (tshirtContractDeployment && tshirtContractDeployment.contractAddress) {
    contractAddress = tshirtContractDeployment.contractAddress;
    console.log(`Found contract address: ${contractAddress}`);
} else {
    console.warn('CampMamoTShirt deployment not found. Using placeholder address.');
}

// Generate contract info JSON
const contractInfo = {
    chainId,
    address: contractAddress,
    abi: contractAbi
};

// Write to generated directory
const generatedDir = path.resolve(process.cwd(), 'src/generated');

// Create directory if it doesn't exist
if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
}

// Write the contract info to a JSON file
fs.writeFileSync(
    path.join(generatedDir, 'contractInfo.json'), 
    JSON.stringify(contractInfo, null, 2)
);

console.log(`Generated contract info in ${generatedDir}/contractInfo.json`);
