/**
 * ConnectFive Contract Deployment Script
 *
 * Usage:
 *   npx hardhat run scripts/deploy-connectfive.js --network celo-testnet
 *   npx hardhat run scripts/deploy-connectfive.js --network celo
 */

const hre = require("hardhat");

async function main() {
  console.log("🎮 Deploying ConnectFive contract...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying from account:", deployer.address);

  // Check balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", hre.ethers.utils.formatEther(balance), "CELO\n");

  // Deploy contract
  console.log("🚀 Deploying contract...");
  const ConnectFive = await hre.ethers.getContractFactory("ConnectFive");
  const connectFive = await ConnectFive.deploy();

  await connectFive.deployed();

  console.log("✅ ConnectFive deployed to:", connectFive.address);
  console.log("📊 Transaction hash:", connectFive.deployTransaction.hash);

  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await connectFive.deployTransaction.wait(5);

  console.log("✅ Contract confirmed!\n");

  // Log contract details
  console.log("📋 Contract Details:");
  console.log("   Address:", connectFive.address);
  console.log("   Network:", hre.network.name);
  console.log("   Grid Size:", "7 columns × 6 rows");
  console.log("   Win Length:", "4 pieces");
  console.log("   Timeout:", "10 minutes");

  // Verify on block explorer (if not localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contract on block explorer...");
    console.log("   Run this command to verify:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${connectFive.address}`);
  }

  // Instructions for updating frontend
  console.log("\n📝 Next Steps:");
  console.log("1. Update lib/types/games.ts with contract address:");
  console.log(`   contractAddress: "${connectFive.address}",`);
  console.log("2. Update hasFee if you want to charge a platform fee");
  console.log("3. Test the contract on testnet before mainnet deployment");
  console.log("4. Create ABI file for frontend integration");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    address: connectFive.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: connectFive.deployTransaction.hash,
    blockNumber: connectFive.deployTransaction.blockNumber,
  };

  const fs = require('fs');
  const path = require('path');

  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `connectfive-${hre.network.name}.json`
  );

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
