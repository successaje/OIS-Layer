import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployAgentRegistryFixture } from './fixtures';

describe('AgentRegistry', function () {
  describe('Agent Registration', function () {
    it('Should allow agent to register with stake', async function () {
      const { agent, registry, reputationToken } = await loadFixture(deployAgentRegistryFixture);
      
      const ensName = 'agent.eth';
      const specialization = 'yield-farming';
      const stakeAmount = hre.ethers.parseEther('10');

      await reputationToken.connect(agent).approve(await registry.getAddress(), stakeAmount);

      const tx = await registry.connect(agent).registerAgent(ensName, specialization, stakeAmount);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'AgentRegistered'
      );

      expect(event).to.not.be.undefined;
      expect(event?.args[1]).to.equal(agent.address);
      expect(event?.args[2]).to.equal(ensName);

      const agentId = event?.args[0];
      const agentInfo = await registry.getAgent(agentId);
      expect(agentInfo.agentAddress).to.equal(agent.address);
      expect(agentInfo.stake).to.equal(stakeAmount);
      expect(agentInfo.reputation).to.equal(1000n);
    });

    it('Should reject registration with insufficient stake', async function () {
      const { agent, registry, reputationToken } = await loadFixture(deployAgentRegistryFixture);
      
      const stakeAmount = hre.ethers.parseEther('0.1'); // Below minimum

      await reputationToken.connect(agent).approve(await registry.getAddress(), stakeAmount);

      await expect(
        registry.connect(agent).registerAgent('agent.eth', 'specialization', stakeAmount)
      ).to.be.revertedWithCustomError(registry, 'StakeBelowMinimum');
    });

    it('Should reject empty ENS name', async function () {
      const { agent, registry, reputationToken } = await loadFixture(deployAgentRegistryFixture);
      
      const stakeAmount = hre.ethers.parseEther('10');
      await reputationToken.connect(agent).approve(await registry.getAddress(), stakeAmount);

      await expect(
        registry.connect(agent).registerAgent('', 'specialization', stakeAmount)
      ).to.be.revertedWithCustomError(registry, 'EmptyENSName');
    });
  });

  describe('Cross-Chain Identity', function () {
    it('Should sync cross-chain agent registration', async function () {
      const { owner, registry } = await loadFixture(deployAgentRegistryFixture);
      
      const ensName = 'agent.eth';
      const specialization = 'yield-farming';
      const srcChainId = 2n;
      
      // Generate cross-chain identity
      const testAgent = hre.ethers.Wallet.createRandom();
      const crossChainIdentity = hre.ethers.keccak256(
        hre.ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'string', 'uint64'],
          [testAgent.address, ensName, srcChainId]
        )
      );

      const agentData = {
        agentId: 1,
        agentAddress: testAgent.address,
        ensName: ensName,
        specialization: specialization,
        reputation: 1000,
        srcChainId: srcChainId,
        crossChainIdentity: crossChainIdentity
      };

      const tx = await registry.connect(owner).syncCrossChainRegistration(agentData);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'CrossChainRegistrationSynced'
      );

      expect(event).to.not.be.undefined;
      const agentId = event?.args[0];
      
      const agentInfo = await registry.getAgent(agentId);
      expect(agentInfo.crossChainIdentity).to.equal(crossChainIdentity);
      expect(agentInfo.registeredChains.length).to.equal(2); // srcChainId + currentChainId
    });

    it('Should verify agent on chain', async function () {
      const { agent, registry, reputationToken } = await loadFixture(deployAgentRegistryFixture);
      
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

      // Verify on current chain
      const isVerified = await registry.verifyAgentOnChain(agentId, 1n);
      expect(isVerified).to.be.true;

      // Not verified on other chain
      const isVerifiedOther = await registry.verifyAgentOnChain(agentId, 2n);
      expect(isVerifiedOther).to.be.false;
    });
  });

  describe('Stake Management', function () {
    it('Should allow agent to increase stake', async function () {
      const { agent, registry, reputationToken } = await loadFixture(deployAgentRegistryFixture);
      
      // Register agent
      const initialStake = hre.ethers.parseEther('10');
      await reputationToken.connect(agent).approve(await registry.getAddress(), initialStake);
      await registry.connect(agent).registerAgent('agent.eth', 'specialization', initialStake);
      
      const agentId = await registry.addressToAgentId(agent.address);

      // Increase stake
      const additionalStake = hre.ethers.parseEther('5');
      await reputationToken.connect(agent).approve(await registry.getAddress(), additionalStake);
      
      const tx = await registry.connect(agent).increaseStake(agentId, additionalStake);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'StakeIncreased'
      );

      expect(event).to.not.be.undefined;
      
      const agentInfo = await registry.getAgent(agentId);
      expect(agentInfo.stake).to.equal(initialStake + additionalStake);
    });
  });

  describe('Slashing', function () {
    it('Should allow owner to slash agent', async function () {
      const { owner, agent, registry, reputationToken } = await loadFixture(deployAgentRegistryFixture);
      
      // Register agent
      const stakeAmount = hre.ethers.parseEther('10');
      await reputationToken.connect(agent).approve(await registry.getAddress(), stakeAmount);
      await registry.connect(agent).registerAgent('agent.eth', 'specialization', stakeAmount);
      const agentId = await registry.addressToAgentId(agent.address);

      // Slash agent
      const tx = await registry.connect(owner).slashAgent(agentId, 'Misbehavior');
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'AgentSlashed'
      );

      expect(event).to.not.be.undefined;
      
      const agentInfo = await registry.getAgent(agentId);
      expect(agentInfo.slashCount).to.equal(1n);
      expect(agentInfo.reputation).to.equal(900n); // Reduced by 100
    });
  });
});
