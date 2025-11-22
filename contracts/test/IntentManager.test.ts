import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployIntentManagerFixture } from './fixtures';

describe('IntentManager', function () {
  let owner: any;
  let user: any;
  let intentManager: any;

  beforeEach(async function () {
    const fixture = await loadFixture(deployIntentManagerFixture);
    owner = fixture.owner;
    user = fixture.user;
    intentManager = fixture.intentManager;
  });

  describe('Intent Creation', function () {
    it('Should create a new intent', async function () {
      const intentSpec = 'Get 5% yield on stablecoins';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day

      const tx = await intentManager.createIntent(
        intentSpec,
        filecoinCid,
        deadline,
        hre.ethers.ZeroAddress, // Native token
        { value: hre.ethers.parseEther('1.0') }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'IntentCreated'
      );

      expect(event).to.not.be.undefined;
    });

    it('Should reject intent with invalid deadline', async function () {
      const intentSpec = 'Test intent';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 3600; // Too soon

      await expect(
        intentManager.createIntent(
          intentSpec,
          filecoinCid,
          deadline,
          hre.ethers.ZeroAddress,
          { value: hre.ethers.parseEther('1.0') }
        )
      ).to.be.revertedWith('Deadline too soon');
    });
  });

  describe('Proposal Submission', function () {
    it('Should allow agent to submit proposal', async function () {
      // First create intent
      const intentSpec = 'Test intent';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const createTx = await intentManager.createIntent(
        intentSpec,
        filecoinCid,
        deadline,
        hre.ethers.ZeroAddress,
        { value: hre.ethers.parseEther('1.0') }
      );

      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(
        (log: any) => log.fragment?.name === 'IntentCreated'
      );
      const intentId = createEvent?.args[0];

      // Start bidding
      await intentManager.startBidding(intentId);

      // Submit proposal
      const proposalTx = await intentManager.submitProposal(
        intentId,
        1, // agentId
        'Test strategy',
        hre.ethers.parseEther('0.01'),
        5, // expectedAPY
        86400, // timeline
        '0x', // signature
        hre.ethers.id('proof-cid')
      );

      const proposalReceipt = await proposalTx.wait();
      const proposalEvent = proposalReceipt.logs.find(
        (log: any) => log.fragment?.name === 'ProposalSubmitted'
      );

      expect(proposalEvent).to.not.be.undefined;
    });
  });

  describe('Agent Selection', function () {
    it('Should allow user to select agent', async function () {
      // Create intent
      const intentSpec = 'Test intent';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const createTx = await intentManager.createIntent(
        intentSpec,
        filecoinCid,
        deadline,
        hre.ethers.ZeroAddress,
        { value: hre.ethers.parseEther('1.0') }
      );

      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(
        (log: any) => log.fragment?.name === 'IntentCreated'
      );
      const intentId = createEvent?.args[0];

      // Start bidding and submit proposal
      await intentManager.startBidding(intentId);
      const proposalTx = await intentManager.submitProposal(
        intentId,
        1,
        'Test strategy',
        hre.ethers.parseEther('0.01'),
        5,
        86400,
        '0x',
        hre.ethers.id('proof-cid')
      );

      const proposalReceipt = await proposalTx.wait();
      const proposalEvent = proposalReceipt.logs.find(
        (log: any) => log.fragment?.name === 'ProposalSubmitted'
      );
      const proposalId = proposalEvent?.args[1];

      // Select agent
      const selectTx = await intentManager.selectAgent(intentId, proposalId);
      const selectReceipt = await selectTx.wait();
      const selectEvent = selectReceipt.logs.find(
        (log: any) => log.fragment?.name === 'AgentSelected'
      );

      expect(selectEvent).to.not.be.undefined;
    });
  });
});
