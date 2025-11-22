import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Intent Relay Across Two Chains', function () {
  let owner: any;
  let user: any;
  let intentManagerChain1: any;
  let intentManagerChain2: any;
  let mockEndpoint: any;

  async function deployFixture() {
    const [owner, user] = await hre.ethers.getSigners();

    // Deploy mock LayerZero endpoint
    const MockEndpoint = await hre.ethers.getContractFactory('MockLayerZeroEndpoint');
    const mockEndpoint = await MockEndpoint.deploy();

    // Deploy mock CCIP router
    const MockCcipRouter = await hre.ethers.getContractFactory('MockCcipRouter');
    const mockCcipRouter = await MockCcipRouter.deploy();

    // Deploy IntentManager for Chain 1
    const IntentManager = await hre.ethers.getContractFactory('IntentManager');
    const intentManagerChain1 = await IntentManager.deploy(
      await mockEndpoint.getAddress(),
      await mockCcipRouter.getAddress(),
      owner.address,
      1 // chainId = 1
    );

    // Deploy IntentManager for Chain 2
    const intentManagerChain2 = await IntentManager.deploy(
      await mockEndpoint.getAddress(),
      await mockCcipRouter.getAddress(),
      owner.address,
      2 // chainId = 2
    );

    return { owner, user, intentManagerChain1, intentManagerChain2, mockEndpoint };
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployFixture);
    owner = fixture.owner;
    user = fixture.user;
    intentManagerChain1 = fixture.intentManagerChain1;
    intentManagerChain2 = fixture.intentManagerChain2;
    mockEndpoint = fixture.mockEndpoint;
  });

  describe('Full Intent Relay Flow', function () {
    it('Should create intent on Chain 1 and relay to Chain 2', async function () {
      // Step 1: Create intent on Chain 1
      const intentSpec = 'Execute cross-chain swap';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const createTx = await intentManagerChain1.connect(user).createIntent(
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

      expect(intentId).to.not.be.undefined;

      // Step 2: Start bidding
      await intentManagerChain1.connect(user).startBidding(intentId);

      // Step 3: Send intent to Chain 2 via LayerZero
      const dstEid = 2; // Chain 2 endpoint ID
      const payload = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint256', 'string'],
        [intentId, intentSpec]
      );
      const options = '0x';

      const sendTx = await intentManagerChain1.connect(user).sendIntentToChain(
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

      // Step 4: Verify cross-chain intent data exists
      const crossChainIds = await intentManagerChain1.getIntentCrossChainIds(intentId);
      expect(crossChainIds.length).to.equal(1);

      const crossChainIntent = await intentManagerChain1.getCrossChainIntent(crossChainIds[0]);
      expect(crossChainIntent.intentId).to.equal(intentId);
      expect(crossChainIntent.srcChainId).to.equal(1n);
      expect(crossChainIntent.dstChainId).to.equal(2n);
    });

    it('Should handle intent relay via CCIP', async function () {
      // Create intent
      const intentSpec = 'CCIP relay test';
      const filecoinCid = hre.ethers.id('test-cid');
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const createTx = await intentManagerChain1.connect(user).createIntent(
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

      // Add chain selector for Chain 2
      const chainSelector = 16015286601757825753n; // Example chain selector
      await intentManagerChain1.connect(owner).addChainSelector(chainSelector);

      // Send via CCIP
      const payload = hre.ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [intentId]);
      
      const sendTx = await intentManagerChain1.connect(user).sendViaCCIP(
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
      expect(sendEvent?.args[1]).to.equal(chainSelector);
    });
  });
});

