import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployPaymentEscrowFixture } from './fixtures';

describe('PaymentEscrow', function () {
  describe('Local Escrow', function () {
    it('Should create escrow for native tokens', async function () {
      const { user, paymentEscrow } = await loadFixture(deployPaymentEscrowFixture);
      
      const intentId = hre.ethers.id('test-intent-id');
      const amount = hre.ethers.parseEther('1.0');

      const tx = await paymentEscrow.connect(user).createEscrow(
        user.address,
        intentId,
        { value: amount }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'EscrowCreated'
      );

      expect(event).to.not.be.undefined;
      const escrowId = event?.args[0];
      
      const escrow = await paymentEscrow.getEscrow(escrowId);
      expect(escrow.beneficiary).to.equal(user.address);
      expect(escrow.amount).to.equal(amount);
      expect(escrow.token).to.equal(hre.ethers.ZeroAddress);
    });

    it('Should release escrowed funds', async function () {
      const { user, paymentEscrow } = await loadFixture(deployPaymentEscrowFixture);
      
      const intentId = hre.ethers.id('test-intent-id');
      const amount = hre.ethers.parseEther('1.0');

      const createTx = await paymentEscrow.connect(user).createEscrow(
        user.address,
        intentId,
        { value: amount }
      );
      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(
        (log: any) => log.fragment?.name === 'EscrowCreated'
      );
      const escrowId = createEvent?.args[0];

      const balanceBefore = await hre.ethers.provider.getBalance(user.address);
      
      const releaseTx = await paymentEscrow.connect(user).releaseEscrow(escrowId);
      const releaseReceipt = await releaseTx.wait();
      const releaseEvent = releaseReceipt.logs.find(
        (log: any) => log.fragment?.name === 'EscrowReleased'
      );

      expect(releaseEvent).to.not.be.undefined;
      
      const balanceAfter = await hre.ethers.provider.getBalance(user.address);
      // Note: balance difference will be less than amount due to gas costs
      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });

  describe('Cross-Chain Escrow', function () {
    it('Should create cross-chain escrow', async function () {
      const { user, intentManager, paymentEscrow } = await loadFixture(deployPaymentEscrowFixture);
      
      const crossChainId = hre.ethers.id('test-cross-chain-id');
      const intentId = hre.ethers.id('test-intent-id');
      const srcChainId = 1n;
      const amount = hre.ethers.parseEther('1.0');

      const tx = await paymentEscrow.connect(intentManager).createCrossChainEscrow(
        crossChainId,
        user.address,
        hre.ethers.ZeroAddress,
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

      const escrow = await paymentEscrow.getCrossChainEscrow(crossChainId);
      expect(escrow.beneficiary).to.equal(user.address);
      expect(escrow.amount).to.equal(amount);
      expect(escrow.srcChainId).to.equal(srcChainId);
    });

    it('Should release cross-chain escrow', async function () {
      const { user, intentManager, paymentEscrow } = await loadFixture(deployPaymentEscrowFixture);
      
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

      const balanceBefore = await hre.ethers.provider.getBalance(user.address);
      
      // Release escrow
      const releaseTx = await paymentEscrow.connect(intentManager).releaseCrossChainEscrow(
        crossChainId,
        intentId,
        srcChainId,
        user.address
      );

      const releaseReceipt = await releaseTx.wait();
      const releaseEvent = releaseReceipt.logs.find(
        (log: any) => log.fragment?.name === 'CrossChainEscrowReleased'
      );

      expect(releaseEvent).to.not.be.undefined;
      expect(releaseEvent?.args[0]).to.equal(intentId);
      expect(releaseEvent?.args[1]).to.equal(srcChainId);

      const balanceAfter = await hre.ethers.provider.getBalance(user.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it('Should reject unauthorized cross-chain escrow creation', async function () {
      const { user, paymentEscrow } = await loadFixture(deployPaymentEscrowFixture);
      
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
});

