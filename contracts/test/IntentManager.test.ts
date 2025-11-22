import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployIntentManagerFixture } from './fixtures';

describe('IntentManager', function () {
  describe('Intent Creation', function () {
    it('Should create a new intent', async function () {
      const { user, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      const intentSpec = 'Get 5% yield on stablecoins';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day

      const tx = await intentManager.connect(user).createIntent(
        intentSpec,
        filecoinCid,
        deadline,
        hre.ethers.ZeroAddress,
        { value: hre.ethers.parseEther('1.0') }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'IntentCreated'
      );

      expect(event).to.not.be.undefined;
      const intentId = event?.args[0];
      expect(intentId).to.equal(0n);

      // Verify intent data
      const intent = await intentManager.getIntent(intentId);
      expect(intent.user).to.equal(user.address);
      expect(intent.intentSpec).to.equal(intentSpec);
      expect(intent.amount).to.equal(hre.ethers.parseEther('1.0'));
    });

    it('Should reject intent with invalid deadline', async function () {
      const { user, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      const intentSpec = 'Test intent';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 1800; // Too soon (30 min)

      await expect(
        intentManager.connect(user).createIntent(
          intentSpec,
          filecoinCid,
          deadline,
          hre.ethers.ZeroAddress,
          { value: hre.ethers.parseEther('1.0') }
        )
      ).to.be.revertedWithCustomError(intentManager, 'InvalidDeadline');
    });

    it('Should reject empty intent spec', async function () {
      const { user, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        intentManager.connect(user).createIntent(
          '',
          filecoinCid,
          deadline,
          hre.ethers.ZeroAddress,
          { value: hre.ethers.parseEther('1.0') }
        )
      ).to.be.revertedWithCustomError(intentManager, 'EmptyIntentSpec');
    });
  });

  describe('Bidding and Proposals', function () {
    it('Should start bidding phase', async function () {
      const { user, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      // Create intent
      const intentSpec = 'Test intent';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const createTx = await intentManager.connect(user).createIntent(
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
      await intentManager.connect(user).startBidding(intentId);

      const intent = await intentManager.getIntent(intentId);
      expect(intent.status).to.equal(1); // Bidding status
    });

    it('Should submit agent proposal', async function () {
      const { user, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      // Create intent and start bidding
      const intentSpec = 'Test intent';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const createTx = await intentManager.connect(user).createIntent(
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

      await intentManager.connect(user).startBidding(intentId);

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

    it('Should select agent proposal', async function () {
      const { user, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      // Create intent, start bidding, submit proposal
      const intentSpec = 'Test intent';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const createTx = await intentManager.connect(user).createIntent(
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

      await intentManager.connect(user).startBidding(intentId);
      
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
      const selectTx = await intentManager.connect(user).selectAgent(intentId, proposalId);
      const selectReceipt = await selectTx.wait();
      const selectEvent = selectReceipt.logs.find(
        (log: any) => log.fragment?.name === 'AgentSelected'
      );

      expect(selectEvent).to.not.be.undefined;
      
      const intent = await intentManager.getIntent(intentId);
      expect(intent.status).to.equal(2); // Executing status
      expect(intent.selectedAgentId).to.equal(1n);
    });
  });

  describe('LayerZero V2 Integration', function () {
    it('Should send intent to another chain via LayerZero', async function () {
      const { user, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      // Create intent and set to executing
      const intentSpec = 'Cross-chain intent';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const createTx = await intentManager.connect(user).createIntent(
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

      await intentManager.connect(user).startBidding(intentId);
      await intentManager.submitProposal(intentId, 1, 'Strategy', hre.ethers.parseEther('0.01'), 5, 86400, '0x', hre.ethers.id('proof'));
      const proposals = await intentManager.getIntentProposals(intentId);
      await intentManager.connect(user).selectAgent(intentId, proposals[0].proposalId);

      // Send to another chain
      const dstEid = 2;
      const payload = hre.ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [intentId]);
      const options = '0x';

      const sendTx = await intentManager.connect(user).sendIntentToChain(
        intentId,
        dstEid,
        payload,
        options,
        { value: hre.ethers.parseEther('0.1') }
      );

      const sendReceipt = await sendTx.wait();
      const sendEvent = sendReceipt.logs.find(
        (log: any) => log.fragment?.name === 'CrossChainMessageSent'
      );

      expect(sendEvent).to.not.be.undefined;
      expect(sendEvent?.args[0]).to.equal(intentId);
      expect(sendEvent?.args[1]).to.equal(dstEid);
    });

    it('Should quote cross-chain fee', async function () {
      const { intentManager } = await loadFixture(deployIntentManagerFixture);
      
      const dstEid = 2;
      const message = hre.ethers.AbiCoder.defaultAbiCoder().encode(['string'], ['test']);
      const options = '0x';

      const fee = await intentManager.quoteCrossChainFee(dstEid, message, options, false);
      expect(fee.nativeFee).to.be.gt(0);
    });
  });

  describe('CCIP Integration', function () {
    it('Should send intent via CCIP', async function () {
      const { owner, user, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      // Create intent and set to executing
      const intentSpec = 'CCIP intent';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const createTx = await intentManager.connect(user).createIntent(
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

      await intentManager.connect(user).startBidding(intentId);
      await intentManager.submitProposal(intentId, 1, 'Strategy', hre.ethers.parseEther('0.01'), 5, 86400, '0x', hre.ethers.id('proof'));
      const proposals = await intentManager.getIntentProposals(intentId);
      await intentManager.connect(user).selectAgent(intentId, proposals[0].proposalId);

      // Add chain selector
      const chainSelector = 16015286601757825753n; // Arbitrum Sepolia
      await intentManager.connect(owner).addChainSelector(chainSelector);

      // Send via CCIP
      const payload = hre.ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [intentId]);
      
      const sendTx = await intentManager.connect(user).sendViaCCIP(
        intentId,
        chainSelector,
        payload,
        { value: hre.ethers.parseEther('0.1') }
      );

      const sendReceipt = await sendTx.wait();
      const sendEvent = sendReceipt.logs.find(
        (log: any) => log.fragment?.name === 'IntentSentViaCCIP'
      );

      expect(sendEvent).to.not.be.undefined;
      expect(sendEvent?.args[0]).to.equal(intentId);
    });
  });

  describe('Access Control', function () {
    it('Should add and remove executors', async function () {
      const { owner, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      const executor = hre.ethers.Wallet.createRandom();
      
      await intentManager.connect(owner).addExecutor(executor.address);
      const hasRole = await intentManager.hasRole(
        await intentManager.EXECUTOR_ROLE(),
        executor.address
      );
      expect(hasRole).to.be.true;

      await intentManager.connect(owner).removeExecutor(executor.address);
      const hasRoleAfter = await intentManager.hasRole(
        await intentManager.EXECUTOR_ROLE(),
        executor.address
      );
      expect(hasRoleAfter).to.be.false;
    });

    it('Should add and remove oracles', async function () {
      const { owner, intentManager } = await loadFixture(deployIntentManagerFixture);
      
      const oracle = hre.ethers.Wallet.createRandom();
      
      await intentManager.connect(owner).addOracle(oracle.address);
      const hasRole = await intentManager.hasRole(
        await intentManager.ORACLE_ROLE(),
        oracle.address
      );
      expect(hasRole).to.be.true;
    });
  });
});
