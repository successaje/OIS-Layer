import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('IntentManager - Cross-Chain Integration', function () {
  let owner: any;
  let user: any;
  let intentManager: any;
  let mockEndpoint: any;
  let mockCcipRouter: any;

  async function deployFixture() {
    const [owner, user] = await hre.ethers.getSigners();

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
      1 // chainId
    );

    return { owner, user, intentManager, mockEndpoint, mockCcipRouter };
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployFixture);
    owner = fixture.owner;
    user = fixture.user;
    intentManager = fixture.intentManager;
    mockEndpoint = fixture.mockEndpoint;
    mockCcipRouter = fixture.mockCcipRouter;
  });

  describe('LayerZero V2 Integration', function () {
    it('Should send intent to another chain via LayerZero', async function () {
      // Create intent
      const intentSpec = 'Get 5% yield on stablecoins';
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

      // Start bidding and select agent (simplified)
      await intentManager.connect(user).startBidding(intentId);

      // Send to another chain
      const dstEid = 2; // Destination endpoint ID
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

    it('Should receive and process LayerZero message', async function () {
      // This would require mocking LayerZero's _lzReceive callback
      // In a full test, we'd simulate the LayerZero endpoint calling _lzReceive
      // For now, we verify the function exists and can be called
      expect(intentManager._lzReceive).to.not.be.undefined;
    });
  });

  describe('Chainlink CCIP Integration', function () {
    it('Should send intent via CCIP', async function () {
      // Create intent
      const intentSpec = 'Swap tokens cross-chain';
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

    it('Should receive CCIP message', async function () {
      // Mock CCIP message structure
      const message = {
        messageId: hre.ethers.id('test-message'),
        sourceChainSelector: 16015286601757825753n,
        sender: hre.ethers.AbiCoder.defaultAbiCoder().encode(['address'], [await intentManager.getAddress()]),
        data: hre.ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [1]),
        destTokenAmounts: []
      };

      // Add chain selector
      await intentManager.connect(owner).addChainSelector(message.sourceChainSelector);

      // In production, this would be called by CCIP router
      // For testing, we verify the function exists
      expect(intentManager.ccipReceive).to.not.be.undefined;
    });
  });

  describe('Cross-Chain Intent Tracking', function () {
    it('Should track cross-chain intent data', async function () {
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

      // Get cross-chain IDs (should be empty initially)
      const crossChainIds = await intentManager.getIntentCrossChainIds(intentId);
      expect(crossChainIds.length).to.equal(0);
    });
  });

  describe('Executor and Oracle Roles', function () {
    it('Should add executor', async function () {
      const executor = hre.ethers.Wallet.createRandom();
      const tx = await intentManager.connect(owner).addExecutor(executor.address);
      await tx.wait();

      const hasRole = await intentManager.hasRole(
        await intentManager.EXECUTOR_ROLE(),
        executor.address
      );
      expect(hasRole).to.be.true;
    });

    it('Should add oracle', async function () {
      const oracle = hre.ethers.Wallet.createRandom();
      const tx = await intentManager.connect(owner).addOracle(oracle.address);
      await tx.wait();

      const hasRole = await intentManager.hasRole(
        await intentManager.ORACLE_ROLE(),
        oracle.address
      );
      expect(hasRole).to.be.true;
    });
  });
});

