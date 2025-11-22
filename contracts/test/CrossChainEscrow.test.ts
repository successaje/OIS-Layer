import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('PaymentEscrow - Cross-Chain Settlement', function () {
  let owner: any;
  let user: any;
  let paymentEscrow: any;
  let intentManager: any;

  async function deployFixture() {
    const [owner, user] = await hre.ethers.getSigners();

    // Deploy PaymentEscrow
    const PaymentEscrow = await hre.ethers.getContractFactory('PaymentEscrow');
    const paymentEscrow = await PaymentEscrow.deploy(owner.address);

    // Deploy mock IntentManager
    const MockIntentManager = await hre.ethers.getContractFactory('MockIntentManager');
    const intentManager = await MockIntentManager.deploy();

    // Authorize IntentManager to release escrows
    await paymentEscrow.connect(owner).addAuthorizedReleaser(await intentManager.getAddress());

    return { owner, user, paymentEscrow, intentManager };
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployFixture);
    owner = fixture.owner;
    user = fixture.user;
    paymentEscrow = fixture.paymentEscrow;
    intentManager = fixture.intentManager;
  });

  describe('Cross-Chain Escrow Creation', function () {
    it('Should create cross-chain escrow', async function () {
      const crossChainId = hre.ethers.id('test-cross-chain-id');
      const intentId = hre.ethers.id('test-intent-id');
      const srcChainId = 1n;
      const amount = hre.ethers.parseEther('1.0');

      const tx = await paymentEscrow.connect(intentManager).createCrossChainEscrow(
        crossChainId,
        user.address,
        hre.ethers.ZeroAddress, // Native token
        amount,
        intentId,
        srcChainId,
        { value: amount }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'EscrowCreated'
      );

      expect(event).to.not.be.undefined;

      // Verify escrow exists
      const escrow = await paymentEscrow.getCrossChainEscrow(crossChainId);
      expect(escrow.beneficiary).to.equal(user.address);
      expect(escrow.amount).to.equal(amount);
      expect(escrow.srcChainId).to.equal(srcChainId);
    });

    it('Should reject unauthorized cross-chain escrow creation', async function () {
      const crossChainId = hre.ethers.id('test-cross-chain-id');
      const intentId = hre.ethers.id('test-intent-id');
      const amount = hre.ethers.parseEther('1.0');

      await expect(
        paymentEscrow.connect(user).createCrossChainEscrow(
          crossChainId,
          user.address,
          hre.ethers.ZeroAddress,
          amount,
          intentId,
          1n,
          { value: amount }
        )
      ).to.be.revertedWith('Not authorized');
    });
  });

  describe('Cross-Chain Escrow Release', function () {
    it('Should release cross-chain escrow', async function () {
      const crossChainId = hre.ethers.id('test-cross-chain-id');
      const intentId = hre.ethers.id('test-intent-id');
      const srcChainId = 1n;
      const amount = hre.ethers.parseEther('1.0');

      // Create escrow
      await paymentEscrow.connect(intentManager).createCrossChainEscrow(
        crossChainId,
        user.address,
        hre.ethers.ZeroAddress,
        amount,
        intentId,
        srcChainId,
        { value: amount }
      );

      // Release escrow
      const balanceBefore = await hre.ethers.provider.getBalance(user.address);
      
      const tx = await paymentEscrow.connect(intentManager).releaseCrossChainEscrow(
        crossChainId,
        intentId,
        srcChainId,
        user.address
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'CrossChainEscrowReleased'
      );

      expect(event).to.not.be.undefined;
      expect(event?.args[0]).to.equal(intentId);
      expect(event?.args[1]).to.equal(srcChainId);

      // Verify balance increased
      const balanceAfter = await hre.ethers.provider.getBalance(user.address);
      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it('Should reject release with invalid source chain', async function () {
      const crossChainId = hre.ethers.id('test-cross-chain-id');
      const intentId = hre.ethers.id('test-intent-id');
      const amount = hre.ethers.parseEther('1.0');

      // Create escrow with srcChainId = 1
      await paymentEscrow.connect(intentManager).createCrossChainEscrow(
        crossChainId,
        user.address,
        hre.ethers.ZeroAddress,
        amount,
        intentId,
        1n,
        { value: amount }
      );

      // Try to release with wrong srcChainId
      await expect(
        paymentEscrow.connect(intentManager).releaseCrossChainEscrow(
          crossChainId,
          intentId,
          2n, // Wrong chain ID
          user.address
        )
      ).to.be.revertedWith('Invalid source chain');
    });
  });
});

