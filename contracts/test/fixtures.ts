import hre from 'hardhat';

export async function deployIntentManagerFixture() {
  const [owner, user] = await hre.ethers.getSigners();

  // Deploy mock endpoint for LayerZero
  // In production, use actual LayerZero endpoint
  const MockEndpoint = await hre.ethers.getContractFactory('MockEndpoint');
  const mockEndpoint = await MockEndpoint.deploy();

  // Deploy IntentManager
  const IntentManager = await hre.ethers.getContractFactory('IntentManager');
  const intentManager = await IntentManager.deploy(
    await mockEndpoint.getAddress(),
    owner.address
  );

  return { owner, user, intentManager, mockEndpoint };
}

export async function deployAgentRegistryFixture() {
  const [owner, agent] = await hre.ethers.getSigners();

  // Deploy mock ERC20 for reputation token
  const MockERC20 = await hre.ethers.getContractFactory('MockERC20');
  const reputationToken = await MockERC20.deploy('Reputation Token', 'REP');

  // Mint tokens to agent
  await reputationToken.mint(agent.address, hre.ethers.parseEther('100'));

  // Deploy AgentRegistry
  const AgentRegistry = await hre.ethers.getContractFactory('AgentRegistry');
  const registry = await AgentRegistry.deploy(
    await reputationToken.getAddress(),
    hre.ethers.parseEther('1'), // minStake
    owner.address
  );

  return { owner, agent, registry, reputationToken };
}
