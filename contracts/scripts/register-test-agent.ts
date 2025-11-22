import hre from "hardhat";

/**
 * Register a test agent for testing intent fulfillment
 * 
 * This script registers an agent with the minimum stake required.
 */

const MIN_STAKE = hre.ethers.parseEther("1"); // 1 REP

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  const network = hre.network.name;

  console.log("Registering test agent on:", network);
  console.log("Deployer:", deployer.address);

  // Get contract addresses from deployment
  const deploymentFile = `deployments/${network}.json`;
  const fs = await import("fs");
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const agentRegistryAddress = deployment.contracts.agentRegistry;
  const reputationTokenAddress = deployment.contracts.reputationToken;

  console.log("AgentRegistry:", agentRegistryAddress);
  console.log("ReputationToken:", reputationTokenAddress);

  // Get contracts
  const reputationToken = await ethers.getContractAt(
    "MockERC20",
    reputationTokenAddress
  );

  const agentRegistry = await ethers.getContractAt(
    "AgentRegistry",
    agentRegistryAddress
  );

  // Check balance
  const balance = await reputationToken.balanceOf(deployer.address);
  console.log("\nCurrent REP balance:", hre.ethers.formatEther(balance));

  if (balance < MIN_STAKE) {
    console.log("⚠️  Insufficient REP balance. Minting tokens...");
    const mintTx = await reputationToken.mint(
      deployer.address,
      MIN_STAKE * 10n // Mint 10x minimum stake
    );
    await mintTx.wait();
    console.log("✅ Tokens minted!");
  }

  // Approve tokens
  console.log("\nApproving tokens for staking...");
  const approveTx = await reputationToken.approve(
    agentRegistryAddress,
    MIN_STAKE
  );
  await approveTx.wait();
  console.log("✅ Tokens approved!");

  // Register agent
  console.log("\nRegistering agent...");
  const agentName = `test-agent-${network}`;
  const specialization = "yield-farming";

  const registerTx = await agentRegistry.registerAgent(
    agentName,
    specialization,
    MIN_STAKE
  );

  const receipt = await registerTx.wait();
  console.log("✅ Agent registered! Tx:", registerTx.hash);

  // Get agent ID from event
  const event = receipt.logs.find(
    (log: any) => {
      try {
        const parsed = agentRegistry.interface.parseLog(log);
        return parsed?.name === "AgentRegistered";
      } catch {
        return false;
      }
    }
  );

  if (event) {
    const parsed = agentRegistry.interface.parseLog(event);
    const agentId = parsed?.args[0];
    console.log("\n📋 Agent Details:");
    console.log("  Agent ID:", agentId.toString());
    console.log("  Name:", agentName);
    console.log("  Specialization:", specialization);
    console.log("  Stake:", hre.ethers.formatEther(MIN_STAKE), "REP");

    // Get agent info
    const agentInfo = await agentRegistry.getAgent(agentId);
    console.log("\n  Full Agent Info:");
    console.log("    Owner:", agentInfo.owner);
    console.log("    Reputation:", agentInfo.reputation.toString());
    console.log("    TotalStaked:", hre.ethers.formatEther(agentInfo.totalStaked), "REP");
    console.log("    Status:", agentInfo.status === 0 ? "Active" : "Inactive");
  }

  console.log("\n✅ Test agent registration complete!");
  console.log("\nNext steps:");
  console.log("1. Create an intent to test agent participation");
  console.log("2. Have the agent submit a proposal");
  console.log("3. Test intent execution");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

