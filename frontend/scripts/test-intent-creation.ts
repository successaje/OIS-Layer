/**
 * Test Script for Intent Creation
 * 
 * This script helps debug intent creation issues by:
 * 1. Checking wallet connection
 * 2. Verifying network
 * 3. Checking contract addresses
 * 4. Testing contract interaction
 * 
 * Run this in the browser console on the intent creation page
 */

export function testIntentCreation() {
  console.log('🧪 Testing Intent Creation...\n');

  // Check if wagmi is available
  if (typeof window === 'undefined') {
    console.error('❌ This script must run in the browser');
    return;
  }

  // Get wagmi config from window (if available)
  const wagmiConfig = (window as any).wagmiConfig;
  
  if (!wagmiConfig) {
    console.warn('⚠️ Wagmi config not found on window. Make sure wagmi is initialized.');
  }

  // Test 1: Check wallet connection
  console.log('1️⃣ Checking Wallet Connection...');
  const checkWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        console.error('❌ MetaMask or wallet not detected');
        return false;
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        console.error('❌ No wallet connected');
        return false;
      }
      
      console.log('✅ Wallet connected:', accounts[0]);
      return true;
    } catch (error) {
      console.error('❌ Error checking wallet:', error);
      return false;
    }
  };

  // Test 2: Check network
  console.log('\n2️⃣ Checking Network...');
  const checkNetwork = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        return false;
      }
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chainId, 16);
      
      console.log('Current Chain ID:', chainIdNum);
      
      const supportedChains = {
        11155111: 'Sepolia',
        84532: 'Base Sepolia',
      };
      
      if (chainIdNum in supportedChains) {
        console.log(`✅ Connected to ${supportedChains[chainIdNum as keyof typeof supportedChains]}`);
        return chainIdNum;
      } else {
        console.error(`❌ Unsupported network. Please switch to Sepolia (11155111) or Base Sepolia (84532)`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error checking network:', error);
      return null;
    }
  };

  // Test 3: Check contract addresses
  console.log('\n3️⃣ Checking Contract Addresses...');
  const checkContracts = (chainId: number) => {
    const addresses: Record<number, any> = {
      11155111: {
        intentManager: '0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3',
        agentRegistry: '0x3500C12Fbc16CB9beC23362b7524306ccac5018B',
        paymentEscrow: '0x6b27B5864cEF6DC12159cD1DC5b335d6abcFC1a5',
      },
      84532: {
        intentManager: '0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7',
        agentRegistry: '0x47f4917805C577a168d411b4531F2A49fBeF311e',
        paymentEscrow: '0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892',
      },
    };

    const chainAddresses = addresses[chainId];
    if (!chainAddresses) {
      console.error('❌ No contract addresses for chain', chainId);
      return null;
    }

    console.log('✅ Contract addresses found:');
    console.log('  IntentManager:', chainAddresses.intentManager);
    console.log('  AgentRegistry:', chainAddresses.agentRegistry);
    console.log('  PaymentEscrow:', chainAddresses.paymentEscrow);
    
    return chainAddresses;
  };

  // Test 4: Test contract read
  console.log('\n4️⃣ Testing Contract Read...');
  const testContractRead = async (chainId: number, contractAddress: string) => {
    try {
      if (typeof window.ethereum === 'undefined') {
        return false;
      }

      // Simple test: try to read nextIntentId
      const provider = new (window as any).ethers?.providers?.Web3Provider(window.ethereum);
      if (!provider) {
        console.error('❌ Ethers.js not available');
        return false;
      }

      const abi = [
        {
          name: "nextIntentId",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "uint256" }],
        },
      ];

      const contract = new (window as any).ethers?.Contract(contractAddress, abi, provider);
      const nextId = await contract.nextIntentId();
      
      console.log('✅ Contract read successful. Next Intent ID:', nextId.toString());
      return true;
    } catch (error: any) {
      console.error('❌ Contract read failed:', error.message);
      return false;
    }
  };

  // Test 5: Test contract write (simulation)
  console.log('\n5️⃣ Testing Contract Write Parameters...');
  const testWriteParams = () => {
    const testIntent = "Get best yield for 0.01 ETH";
    const filecoinCid = `0x${"0".repeat(64)}`;
    const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours
    const token = "0x0000000000000000000000000000000000000000"; // Native ETH
    const amount = 0n; // For native ETH

    console.log('Test parameters:');
    console.log('  Intent Spec:', testIntent);
    console.log('  Filecoin CID:', filecoinCid);
    console.log('  Deadline:', new Date(deadline * 1000).toISOString());
    console.log('  Token:', token);
    console.log('  Amount:', amount.toString());
    console.log('  Value (ETH):', '0.01');

    return {
      intentSpec: testIntent,
      filecoinCid,
      deadline: BigInt(deadline),
      token,
      amount,
      value: '0.01', // ETH
    };
  };

  // Run all tests
  const runTests = async () => {
    const walletConnected = await checkWallet();
    if (!walletConnected) {
      console.error('\n❌ Wallet not connected. Please connect your wallet first.');
      return;
    }

    const chainId = await checkNetwork();
    if (!chainId) {
      console.error('\n❌ Invalid network. Please switch to Sepolia or Base Sepolia.');
      return;
    }

    const addresses = checkContracts(chainId);
    if (!addresses) {
      console.error('\n❌ Contract addresses not found.');
      return;
    }

    await testContractRead(chainId, addresses.intentManager);
    testWriteParams();

    console.log('\n✅ All tests completed!');
    console.log('\n📝 To create an intent, use this format:');
    console.log(`
      const params = {
        intentSpec: "Get best yield for 0.01 ETH",
        amount: "0.01",
        token: "0x0000000000000000000000000000000000000000",
        deadline: ${Math.floor(Date.now() / 1000) + 86400},
        filecoinCid: "bafybeigdyrzt5sfp7udm7hu76uh7y2anf3m7fwj2r2ytcpgx2h2u22kf4i"
      };
    `);
  };

  runTests();
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).testIntentCreation = testIntentCreation;
}

