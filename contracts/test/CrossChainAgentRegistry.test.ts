import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('AgentRegistry - Cross-Chain Identity', function () {
  let owner: any;
  let agent: any;
  let registry: any;
  let reputationToken: any;

  async function deployFixture() {
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
      1 // chainId
    );

    return { owner, agent, registry, reputationToken };
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployFixture);
    owner = fixture.owner;
    agent = fixture.agent;
    registry = fixture.registry;
    reputationToken = fixture.reputationToken;
  });

  describe('Cross-Chain Registration Sync', function () {
    it('Should sync cross-chain agent registration', async function () {
      // Register agent on source chain (simulated)
      const ensName = 'agent.eth';
      const specialization = 'yield-farming';
      const srcChainId = 2n; // Source chain ID
      
      // Generate cross-chain identity (as would be done on source chain)
      const crossChainIdentity = hre.ethers.keccak256(
        hre.ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'string', 'uint64'],
          [agent.address, ensName, srcChainId]
        )
      );

      // Prepare cross-chain agent data
      const agentData = {
        agentId: 1,
        agentAddress: agent.address,
        ensName: ensName,
        specialization: specialization,
        reputation: 1000,
        srcChainId: srcChainId,
        crossChainIdentity: crossChainIdentity
      };

      // Sync registration
      const tx = await registry.connect(owner).syncCrossChainRegistration(agentData);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'CrossChainRegistrationSynced'
      );

      expect(event).to.not.be.undefined;
      expect(event?.args[0]).to.be.gt(0); // agentId
      expect(event?.args[1]).to.equal(srcChainId);

      // Verify agent is registered
      const agentId = event?.args[0];
      const agentInfo = await registry.getAgent(agentId);
      expect(agentInfo.agentAddress).to.equal(agent.address);
      expect(agentInfo.ensName).to.equal(ensName);
      expect(agentInfo.crossChainIdentity).to.equal(crossChainIdentity);
    });

    it('Should verify agent on chain', async function () {
      // First register agent locally
      const stakeAmount = hre.ethers.parseEther('10');
      await reputationToken.connect(agent).approve(await registry.getAddress(), stakeAmount);
      
      const registerTx = await registry.connect(agent).registerAgent(
        'agent.eth',
        'specialization',
        stakeAmount
      );
      const registerReceipt = await registerTx.wait();
      const registerEvent = registerReceipt.logs.find(
        (log: any) => log.fragment?.name === 'AgentRegistered'
      );
      const agentId = registerEvent?.args[0];

      // Verify agent is registered on current chain
      const isVerified = await registry.verifyAgentOnChain(agentId, 1n); // Current chain ID
      expect(isVerified).to.be.true;

      // Verify agent is NOT registered on another chain
      const isVerifiedOther = await registry.verifyAgentOnChain(agentId, 2n);
      expect(isVerifiedOther).to.be.false;
    });

    it('Should get agent by cross-chain identity', async function () {
      // Register agent
      const stakeAmount = hre.ethers.parseEther('10');
      await reputationToken.connect(agent).approve(await registry.getAddress(), stakeAmount);
      
      const registerTx = await registry.connect(agent).registerAgent(
        'agent.eth',
        'specialization',
        stakeAmount
      );
      const registerReceipt = await registerTx.wait();
      const registerEvent = registerReceipt.logs.find(
        (log: any) => log.fragment?.name === 'AgentRegistered'
      );
      const agentId = registerEvent?.args[0];
      const crossChainIdentity = registerEvent?.args[4];

      // Get agent by cross-chain identity
      const agentInfo = await registry.getAgentByCrossChainIdentity(crossChainIdentity);
      expect(agentInfo.agentId).to.equal(agentId);
      expect(agentInfo.crossChainIdentity).to.equal(crossChainIdentity);
    });
  });

  describe('Chain Registry Address Management', function () {
    it('Should set chain registry address', async function () {
      const chainId = 2n;
      const registryAddress = hre.ethers.Wallet.createRandom().address;

      const tx = await registry.connect(owner).setChainRegistryAddress(chainId, registryAddress);
      await tx.wait();

      const storedAddress = await registry.chainRegistryAddress(chainId);
      expect(storedAddress).to.equal(registryAddress);
    });
  });
});

