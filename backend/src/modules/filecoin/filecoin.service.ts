import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * @notice Filecoin service using Synapse SDK for Onchain Cloud storage
 * @dev Integrates with Filecoin Calibration Testnet or local emulator
 */
@Injectable()
export class FilecoinService {
  private readonly logger = new Logger(FilecoinService.name);
  private readonly synapseUrl: string;
  private readonly apiKey?: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Use environment variable or default to local emulator
    this.synapseUrl =
      configService.get<string>('FILECOIN_SYNAPSE_URL') ||
      'http://localhost:8080';
    this.apiKey = configService.get<string>('FILECOIN_API_KEY');
  }

  /**
   * Pin JSON data to Filecoin and return CID
   */
  async pinJson(data: any): Promise<string> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.synapseUrl}/api/v1/pin/json`,
          data,
          { headers },
        ),
      );

      const cid = response.data.cid;
      this.logger.log(`Pinned data to Filecoin with CID: ${cid}`);
      return cid;
    } catch (error) {
      this.logger.error('Error pinning to Filecoin:', error);
      // Fallback: return mock CID for development
      return `mock-cid-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
  }

  /**
   * Pin file/blob to Filecoin
   */
  async pinFile(file: Buffer, filename: string): Promise<string> {
    try {
      // Try to use form-data if available, otherwise use multipart/form-data manually
      let formData: any;
      let headers: Record<string, any> = {};

      try {
        // Try to use form-data package if installed
        const FormData = require('form-data');
        formData = new FormData();
        formData.append('file', file, {
          filename,
          contentType: 'application/octet-stream',
        });
        headers = { ...formData.getHeaders() };
      } catch {
        // Fallback: create multipart form data manually
        const boundary = `----WebKitFormBoundary${Date.now()}`;
        const formDataBuffer = Buffer.concat([
          Buffer.from(`--${boundary}\r\n`),
          Buffer.from(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`),
          Buffer.from(`Content-Type: application/octet-stream\r\n\r\n`),
          file,
          Buffer.from(`\r\n--${boundary}--\r\n`),
        ]);
        formData = formDataBuffer;
        headers = {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': formDataBuffer.length.toString(),
        };
      }

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.synapseUrl}/api/v1/pin/file`, formData, {
          headers,
        }),
      );

      const cid = response.data.cid;
      this.logger.log(`Pinned file to Filecoin with CID: ${cid}`);
      return cid;
    } catch (error) {
      this.logger.error('Error pinning file to Filecoin:', error);
      return `mock-file-cid-${Date.now()}`;
    }
  }

  /**
   * Retrieve data from Filecoin by CID
   */
  async getByCid(cid: string): Promise<any> {
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.synapseUrl}/api/v1/cat/${cid}`, {
          headers,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error retrieving CID ${cid}:`, error);
      throw error;
    }
  }

  /**
   * Verify CID exists on Filecoin
   */
  async verifyCid(cid: string): Promise<boolean> {
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await firstValueFrom(
        this.httpService.head(`${this.synapseUrl}/api/v1/cat/${cid}`, {
          headers,
        }),
      );

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

