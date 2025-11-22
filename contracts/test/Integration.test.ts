import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployFullSystemFixture } from './fixtures';

describe('Full System Integration', function () {
  it('Should complete full intent lifecycle with cross-chain execution', async function () {
    const { user, agent, intentManager, agentRegistry, paymentEscrow, reputationToken } = 
      await loadFixture(deployFullSystemFixture);

    // Step 1: Register agent
    const stakeAmount = hre.ethers.parseEther('10');
    await reputationToken.connect(agent).approve(await agentRegistry.getAddress(), stakeAmount);
    const registerTx = await agentRegistry.connect(agent).registerAgent(
      'agent.eth',
      'yield-farming',
      stakeAmount
    );
    const registerReceipt = await registerTx.wait();
    const registerEvent = registerReceipt.logs.find(
      (log: any) => log.fragment?.name === 'AgentRegistered'
    );
    const agentId = registerEvent?.args[0];

    // Step 2: Create intent
    const intentSpec = 'Get 5% yield on stablecoins across chains';
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

    // Step 3: Start bidding
    await intentManager.connect(user).startBidding(intentId);

    // Step 4: Agent submits proposal
    const proposalTx = await intentManager.submitProposal(
      intentId,
      agentId,
      'Cross-chain yield strategy',
      hre.ethers.parseEther('0.01'),
      5, // expectedAPY
      86400,
      '0x',
      hre.ethers.id('proof-cid')
    );
    const proposalReceipt = await proposalTx.wait();
    const proposalEvent = proposalReceipt.logs.find(
      (log: any) => log.fragment?.name === 'ProposalSubmitted'
    );
    const proposalId = proposalEvent?.args[1];

    // Step 5: User selects agent
    await intentManager.connect(user).selectAgent(intentId, proposalId);

    // Step 6: Send intent to another chain
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

    // Step 7: Verify cross-chain intent tracking
    const crossChainIds = await intentManager.getIntentCrossChainIds(intentId);
    expect(crossChainIds.length).to.equal(1);

    const crossChainIntent = await intentManager.getCrossChainIntent(crossChainIds[0]);
    expect(crossChainIntent.intentId).to.equal(intentId);
    expect(crossChainIntent.srcChainId).to.equal(1n);
  });

  it('Should handle cross-chain agent identity sync', async function () {
    const { owner, agentRegistry } = await loadFixture(deployFullSystemFixture);

    const ensName = 'crosschain-agent.eth';
    const specialization = 'arbitrage';
    const srcChainId = 2n;
    
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
      reputation: 1500,
      srcChainId: srcChainId,
      crossChainIdentity: crossChainIdentity
    };

    const syncTx = await agentRegistry.connect(owner).syncCrossChainRegistration(agentData);
    const syncReceipt = await syncTx.wait();
    const syncEvent = syncReceipt.logs.find(
      (log: any) => log.fragment?.name === 'CrossChainRegistrationSynced'
    );

    expect(syncEvent).to.not.be.undefined;
    
    const agentId = syncEvent?.args[0];
    const agentInfo = await agentRegistry.getAgent(agentId);
    expect(agentInfo.crossChainIdentity).to.equal(crossChainIdentity);
    expect(agentInfo.reputation).to.equal(1500n);
  });
});

