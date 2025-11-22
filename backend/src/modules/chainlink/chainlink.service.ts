import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ethers } from 'ethers';

/**
 * @notice Chainlink service for price feeds, CRE workflows, and Functions
 */
@Injectable()
export class ChainlinkService {
  private readonly logger = new Logger(ChainlinkService.name);
  private readonly rpcUrl?: string;
  private readonly provider?: ethers.Provider;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.rpcUrl = configService.get<string>('RPC_URL');
    if (this.rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    }
  }

  /**
   * Get latest price from Chainlink price feed
   */
  async getPriceFeed(address: string): Promise<{ price: bigint; timestamp: number }> {
    try {
      if (!this.provider) {
        throw new Error('No RPC provider configured');
      }

      // ABI for Chainlink AggregatorV3Interface
      const aggregatorABI = [
        'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
      ];

      const contract = new ethers.Contract(address, aggregatorABI, this.provider);
      const data = await contract.latestRoundData();

      return {
        price: BigInt(data.answer.toString()),
        timestamp: Number(data.updatedAt),
      };
    } catch (error) {
      this.logger.error(`Error fetching price feed ${address}:`, error);
      // Mock data for development
      return {
        price: BigInt('200000000000'), // $2000 with 8 decimals
        timestamp: Math.floor(Date.now() / 1000),
      };
    }
  }

  /**
   * Trigger Chainlink CRE workflow
   */
  async triggerCREWorkflow(workflowId: string, input: any): Promise<string> {
    try {
      const creApiUrl = this.configService.get<string>('CHAINLINK_CRE_API_URL');
      if (!creApiUrl) {
        this.logger.warn('CRE API URL not configured, simulating workflow');
        return `simulated-run-${Date.now()}`;
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${creApiUrl}/workflows/${workflowId}/run`,
          input,
        ),
      );

      return response.data.runId;
    } catch (error) {
      this.logger.error('Error triggering CRE workflow:', error);
      return `simulated-run-${Date.now()}`;
    }
  }

  /**
   * Get CRE workflow run status
   */
  async getCREWorkflowStatus(workflowId: string, runId: string): Promise<any> {
    try {
      const creApiUrl = this.configService.get<string>('CHAINLINK_CRE_API_URL');
      if (!creApiUrl) {
        return { status: 'completed', output: { result: 'simulated' } };
      }

      const response = await firstValueFrom(
        this.httpService.get(
          `${creApiUrl}/workflows/${workflowId}/runs/${runId}`,
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error fetching CRE workflow status:', error);
      return { status: 'unknown' };
    }
  }

  /**
   * Call Chainlink Functions for off-chain data fetch
   */
  async callFunctions(source: string, args: string[]): Promise<string> {
    try {
      const functionsApiUrl = this.configService.get<string>('CHAINLINK_FUNCTIONS_API_URL');
      if (!functionsApiUrl) {
        this.logger.warn('Functions API URL not configured');
        return JSON.stringify({ result: 'simulated' });
      }

      const response = await firstValueFrom(
        this.httpService.post(`${functionsApiUrl}/functions/call`, {
          source,
          args,
        }),
      );

      return response.data.result;
    } catch (error) {
      this.logger.error('Error calling Chainlink Functions:', error);
      return JSON.stringify({ error: 'Functions API unavailable' });
    }
  }
}

