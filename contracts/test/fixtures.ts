import hre from 'hardhat';

export async function deployIntentManagerFixture() {
  const [owner, user, agent] = await hre.ethers.getSigners();

  // Deploy mock LayerZero endpoint
  const MockEndpoint = await hre.ethers.getContractFactory('MockLayerZeroEndpoint');
  const mockEndpoint = await MockEndpoint.deploy();

  // Deploy mock CCIP router
  const MockCcipRouter = await hre.ethers.getContractFactory('MockCcipRouter');
  const mockCcipRouter = await MockCcipRouter.deploy();

  // Deploy IntentManager
  const IntentManager = await hre.ethers.getContractFactory('IntentManager');
  const intentManager = await IntentManager.deploy(
    await mockEndpoint.getAddress(),
    await mockCcipRouter.getAddress(),
    owner.address,
    1n // chainId
  );

  // Set peer for cross-chain communication (simulate LayerZero peer setup)
  await mockEndpoint.setPeer(2, await intentManager.getAddress());

  return { owner, user, agent, intentManager, mockEndpoint, mockCcipRouter };
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
    owner.address,
    1n // chainId
  );

  return { owner, agent, registry, reputationToken };
}

export async function deployPaymentEscrowFixture() {
  const [owner, user, intentManager] = await hre.ethers.getSigners();

  // Deploy PaymentEscrow
  const PaymentEscrow = await hre.ethers.getContractFactory('PaymentEscrow');
  const paymentEscrow = await PaymentEscrow.deploy(owner.address);

  // Authorize IntentManager to release escrows
  await paymentEscrow.connect(owner).addAuthorizedReleaser(intentManager.address);

  return { owner, user, intentManager, paymentEscrow };
}

export async function deployExecutionProxyFixture() {
  const [owner, user] = await hre.ethers.getSigners();

  // Deploy mock LayerZero endpoint
  const MockEndpoint = await hre.ethers.getContractFactory('MockLayerZeroEndpoint');
  const mockEndpoint = await MockEndpoint.deploy();

  // Deploy mock IntentManager and PaymentEscrow
  const MockIntentManager = await hre.ethers.getContractFactory('MockIntentManager');
  const intentManager = await MockIntentManager.deploy();

  const PaymentEscrow = await hre.ethers.getContractFactory('PaymentEscrow');
  const paymentEscrow = await PaymentEscrow.deploy(owner.address);

  // Deploy ExecutionProxy
  const ExecutionProxy = await hre.ethers.getContractFactory('ExecutionProxy');
  const executionProxy = await ExecutionProxy.deploy(
    await mockEndpoint.getAddress(),
    owner.address,
    await intentManager.getAddress(),
    await paymentEscrow.getAddress()
  );

  // Set peer for cross-chain communication
  await mockEndpoint.setPeer(2, await executionProxy.getAddress());

  return { owner, user, executionProxy, mockEndpoint, intentManager, paymentEscrow };
}

export async function deployFullSystemFixture() {
  const [owner, user, agent] = await hre.ethers.getSigners();

  // Deploy all contracts
  const intentFixture = await deployIntentManagerFixture();
  const registryFixture = await deployAgentRegistryFixture();
  const escrowFixture = await deployPaymentEscrowFixture();
  const proxyFixture = await deployExecutionProxyFixture();

  return {
    owner,
    user,
    agent,
    intentManager: intentFixture.intentManager,
    agentRegistry: registryFixture.registry,
    paymentEscrow: escrowFixture.paymentEscrow,
    executionProxy: proxyFixture.executionProxy,
    mockEndpoint: intentFixture.mockEndpoint,
    reputationToken: registryFixture.reputationToken,
  };
}
