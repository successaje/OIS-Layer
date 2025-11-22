import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployExecutionProxyFixture } from './fixtures';

describe('ExecutionProxy', function () {
  describe('Price Feed Management', function () {
    it('Should set price feed for token', async function () {
      const { owner, executionProxy } = await loadFixture(deployExecutionProxyFixture);
      
      const token = hre.ethers.Wallet.createRandom().address;
      const feed = hre.ethers.Wallet.createRandom().address;

      const tx = await executionProxy.connect(owner).setPriceFeed(token, feed);
      await tx.wait();

      const setFeed = await executionProxy.priceFeeds(token);
      expect(setFeed).to.equal(feed);
    });

    it('Should set price staleness threshold', async function () {
      const { owner, executionProxy } = await loadFixture(deployExecutionProxyFixture);
      
      const token = hre.ethers.Wallet.createRandom().address;
      const threshold = 3600; // 1 hour

      const tx = await executionProxy.connect(owner).setPriceStalenessThreshold(token, threshold);
      await tx.wait();

      const setThreshold = await executionProxy.priceStalenessThreshold(token);
      expect(setThreshold).to.equal(threshold);
    });
  });

  describe('Slippage Protection', function () {
    it('Should set default slippage tolerance', async function () {
      const { owner, executionProxy } = await loadFixture(deployExecutionProxyFixture);
      
      const tolerance = 200; // 2%

      const tx = await executionProxy.connect(owner).setDefaultSlippageTolerance(tolerance);
      await tx.wait();

      const setTolerance = await executionProxy.defaultSlippageTolerance();
      expect(setTolerance).to.equal(tolerance);
    });

    it('Should reject slippage tolerance too high', async function () {
      const { owner, executionProxy } = await loadFixture(deployExecutionProxyFixture);
      
      const tolerance = 2000; // 20% (too high)

      await expect(
        executionProxy.connect(owner).setDefaultSlippageTolerance(tolerance)
      ).to.be.revertedWith('Tolerance too high');
    });
  });

  describe('Swap Operations', function () {
    it('Should get swap details', async function () {
      const { executionProxy } = await loadFixture(deployExecutionProxyFixture);
      
      // Get swap (will be empty initially)
      const swap = await executionProxy.getSwap(0);
      expect(swap.intentId).to.equal(0n);
      expect(swap.executed).to.be.false;
    });
  });
});

