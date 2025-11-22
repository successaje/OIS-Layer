import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployAgentRegistryFixture } from './fixtures';

describe('AgentRegistry', function () {
  let owner: any;
  let agent: any;
  let registry: any;
  let reputationToken: any;

  beforeEach(async function () {
    const fixture = await loadFixture(deployAgentRegistryFixture);
    owner = fixture.owner;
    agent = fixture.agent;
    registry = fixture.registry;
    reputationToken = fixture.reputationToken;
  });

  describe('Agent Registration', function () {
    it('Should allow agent to register with stake', async function () {
      const ensName = 'agent.eth';
      const specialization = 'yield-farming';
      const stakeAmount = hre.ethers.parseEther('10');

      // Approve tokens
      await reputationToken.connect(agent).approve(await registry.getAddress(), stakeAmount);

      // Register agent
      const tx = await registry.connect(agent).registerAgent(ensName, specialization, stakeAmount);
      const receipt = await tx.wait();
      const event = receipt.logs.find((log: any) => log.fragment?.name === 'AgentRegistered');

      expect(event).to.not.be.undefined;
      expect(event?.args[1]).to.equal(agent.address);
    });

    it('Should reject registration with insufficient stake', async function () {
      const stakeAmount = hre.ethers.parseEther('0.1'); // Below minimum

      await reputationToken.connect(agent).approve(await registry.getAddress(), stakeAmount);

      await expect(
        registry.connect(agent).registerAgent('agent.eth', 'specialization', stakeAmount)
      ).to.be.revertedWith('Stake below minimum');
    });
  });

  describe('Slashing', function () {
    it('Should allow owner to slash agent', async function () {
      // First register agent
      const stakeAmount = hre.ethers.parseEther('10');
      await reputationToken.connect(agent).approve(await registry.getAddress(), stakeAmount);
      await registry.connect(agent).registerAgent('agent.eth', 'specialization', stakeAmount);
      const agentId = 0;

      // Slash agent
      const tx = await registry.slashAgent(agentId, 'Misbehavior');
      const receipt = await tx.wait();
      const event = receipt.logs.find((log: any) => log.fragment?.name === 'AgentSlashed');

      expect(event).to.not.be.undefined;
    });
  });
});
