import hre from "hardhat";
import * as fs from "fs";

/**
 * LayerZero V2 Endpoint Addresses
 * Source: https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints
 */
const LAYERZERO_ENDPOINTS: { [key: string]: string } = {
  // Mainnets
  ethereum: "0x1a44076050125825900e736c501f859c50fE728c",
  arbitrum: "0x1a44076050125825900e736c501f859c50fE728c",
  optimism: "0x1a44076050125825900e736c501f859c50fE728c",
  base: "0x1a44076050125825900e736c501f859c50fE728c",
  polygon: "0x1a44076050125825900e736c501f859c50fE728c",
  bsc: "0x1a44076050125825900e736c501f859c50fE728c",
  avalanche: "0x1a44076050125825900e736c501f859c50fE728c",
  
  // Testnets
  sepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  arbitrumSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  optimismSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  baseSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  polygonMumbai: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  bscTestnet: "0x6EDCE65403992e310A62460808c4b910D972f10f",
  fuji: "0x6EDCE65403992e310A62460808c4b910D972f10f",
};

/**
 * Chainlink CCIP Router Addresses
 * Source: https://docs.chain.link/ccip/supported-networks
 */
const CCIP_ROUTERS: { [key: string]: string } = {
  // Mainnets
  ethereum: "0x80226fc0Ee2b096224EeAc085Bb9a8cba1146fDd",
  arbitrum: "0x88E492127709447A5AB7da8A1C130117fA4B3F40",
  optimism: "0x261c05167db67B2b619f9d9e3e8bF9539Ca04815",
  base: "0x80AF2F44ed0469018922c9F483dc5A909862fdc2",
  polygon: "0x3C3D92629A02a8D95D5CB9650fe49C3544f69B43",
  avalanche: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
  
  // Testnets
  sepolia: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
  arbitrumSepolia: "0x2a9C5afB0d0e4BAb2AdaDA92493B3D313c4C3b0C",
  optimismSepolia: "0x114A20A10b43D4115e5aeef7345a1A9844850E4E",
  baseSepolia: "0x80AF2F44ed0469018922c9F483dc5A909862fdc2", // Base Sepolia CCIP Router
  polygonMumbai: "0x1035CabC275068e0F4b745A29CEDf38E13aF41b1",
  fuji: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
};

/**
 * Chain IDs
 */
const CHAIN_IDS: { [key: string]: bigint } = {
  ethereum: 1n,
  arbitrum: 42161n,
  optimism: 10n,
  base: 8453n,
  polygon: 137n,
  bsc: 56n,
  avalanche: 43114n,
  sepolia: 11155111n,
  arbitrumSepolia: 421614n,
  optimismSepolia: 11155420n,
  baseSepolia: 84532n,
  polygonMumbai: 80001n,
  bscTestnet: 97n,
  fuji: 43113n,
};

/**
 * Get network name from Hardhat config
 */
function getNetworkName(): string {
  const network = hre.network.name;
  return network;
}

/**
 * Get LayerZero endpoint address for current network
 */
function getLayerZeroEndpoint(): string {
  const network = getNetworkName();
  const endpoint = LAYERZERO_ENDPOINTS[network];
  
  if (!endpoint) {
    throw new Error(`LayerZero endpoint not found for network: ${network}`);
  }
  
  return endpoint;
}

/**
 * Get CCIP router address for current network
 */
function getCcipRouter(): string {
  const network = getNetworkName();
  const router = CCIP_ROUTERS[network];
  
  if (!router) {
    console.warn(`CCIP router not found for network: ${network}, using zero address`);
    return "0x0000000000000000000000000000000000000000";
  }
  
  return router;
}

/**
 * Get chain ID for current network
 */
function getChainId(): bigint {
  const network = getNetworkName();
  const chainId = CHAIN_IDS[network];
  
  if (!chainId) {
    throw new Error(`Chain ID not found for network: ${network}`);
  }
  
  return chainId;
}

async function main() {
  // Use ethers v6 directly with the provider from Hardhat network
  const { ethers } = await import("ethers");
  const provider = new ethers.JsonRpcProvider(hre.config.networks[hre.network.name]?.url);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
  
  const deployer = wallet;
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await provider.getBalance(deployer.address)).toString());
  console.log("Network:", getNetworkName());
  
  const layerZeroEndpoint = getLayerZeroEndpoint();
  const ccipRouter = getCcipRouter();
  const chainId = getChainId();
  
  console.log("\n=== Configuration ===");
  console.log("LayerZero Endpoint:", layerZeroEndpoint);
  console.log("CCIP Router:", ccipRouter);
  console.log("Chain ID:", chainId.toString());
  
  // Get contract factories using ethers v6
  const getContractFactory = async (name: string) => {
    const artifact = await hre.artifacts.readArtifact(name);
    return new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  };
  
  // Deploy MockERC20 for reputation token (for testing, in production use real token)
  console.log("\n=== Deploying MockERC20 (Reputation Token) ===");
  const MockERC20 = await getContractFactory("MockERC20");
  const reputationToken = await MockERC20.deploy("Reputation Token", "REP");
  await reputationToken.waitForDeployment();
  const repTokenAddr = await reputationToken.getAddress();
  console.log("Reputation Token deployed to:", repTokenAddr);
  
  // Deploy AgentRegistry
  console.log("\n=== Deploying AgentRegistry ===");
  const AgentRegistry = await getContractFactory("AgentRegistry");
  const minStake = ethers.parseEther("1"); // 1 REP minimum stake
  const agentRegistry = await AgentRegistry.deploy(repTokenAddr, minStake, deployer.address, chainId);
  await agentRegistry.waitForDeployment();
  const agentRegAddr = await agentRegistry.getAddress();
  console.log("AgentRegistry deployed to:", agentRegAddr);
  
  // Deploy PaymentEscrow
  console.log("\n=== Deploying PaymentEscrow ===");
  const PaymentEscrow = await getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy(deployer.address);
  await paymentEscrow.waitForDeployment();
  const escrowAddr = await paymentEscrow.getAddress();
  console.log("PaymentEscrow deployed to:", escrowAddr);
  
  // Deploy IntentManager
  console.log("\n=== Deploying IntentManager ===");
  const IntentManager = await getContractFactory("IntentManager");
  const intentManager = await IntentManager.deploy(layerZeroEndpoint, ccipRouter, deployer.address, chainId);
  await intentManager.waitForDeployment();
  const intentMgrAddr = await intentManager.getAddress();
  console.log("IntentManager deployed to:", intentMgrAddr);
  
  // Deploy ExecutionProxy
  console.log("\n=== Deploying ExecutionProxy ===");
  const ExecutionProxy = await getContractFactory("ExecutionProxy");
  const executionProxy = await ExecutionProxy.deploy(layerZeroEndpoint, deployer.address, intentMgrAddr, escrowAddr);
  await executionProxy.waitForDeployment();
  const execProxyAddr = await executionProxy.getAddress();
  console.log("ExecutionProxy deployed to:", execProxyAddr);
  
  // Deploy ChainlinkOracleAdapter
  console.log("\n=== Deploying ChainlinkOracleAdapter ===");
  const ChainlinkOracleAdapter = await getContractFactory("ChainlinkOracleAdapter");
  const oracleAdapter = await ChainlinkOracleAdapter.deploy(deployer.address);
  await oracleAdapter.waitForDeployment();
  const oracleAddr = await oracleAdapter.getAddress();
  console.log("ChainlinkOracleAdapter deployed to:", oracleAddr);
  
  // Setup cross-contract relationships
  console.log("\n=== Setting up cross-contract relationships ===");
  
  // Authorize IntentManager and ExecutionProxy to release escrows
  const authTx1 = await paymentEscrow.addAuthorizedReleaser(intentMgrAddr);
  await authTx1.wait();
  console.log("Authorized IntentManager to release escrows");
  
  const authTx2 = await paymentEscrow.addAuthorizedReleaser(execProxyAddr);
  await authTx2.wait();
  console.log("Authorized ExecutionProxy to release escrows");
  
  // Save deployment addresses
  const deploymentInfo = {
    network: getNetworkName(),
    chainId: chainId.toString(),
    deployer: deployer.address,
    contracts: {
      reputationToken: repTokenAddr,
      agentRegistry: agentRegAddr,
      paymentEscrow: escrowAddr,
      intentManager: intentMgrAddr,
      executionProxy: execProxyAddr,
      oracleAdapter: oracleAddr,
    },
    configuration: {
      layerZeroEndpoint,
      ccipRouter,
      minStake: minStake.toString(),
    },
    timestamp: new Date().toISOString(),
  };
  
  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file
  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(`deployments/${getNetworkName()}.json`, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: deployments/${getNetworkName()}.json`);
  
  // Also save to backend for integration
  fs.mkdirSync("../backend", { recursive: true });
  fs.writeFileSync(
    "../backend/.contract-addresses.json",
    JSON.stringify(deploymentInfo.contracts, null, 2)
  );
  console.log("Contract addresses saved to: ../backend/.contract-addresses.json");
  
  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Set up LayerZero peer connections between chains");
  console.log("3. Configure CCIP chain selectors if using CCIP");
  console.log("4. Add price feeds to ChainlinkOracleAdapter");
  console.log("5. Register initial agents in AgentRegistry");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
