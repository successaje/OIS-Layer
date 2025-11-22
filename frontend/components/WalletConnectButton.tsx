'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useEnsName } from 'wagmi';
import { ENSBadge } from './ENSBadge';

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });

  return (
    <div className="flex items-center gap-2">
      {isConnected && ensName && (
        <ENSBadge name={ensName} size="sm" />
      )}
      <ConnectButton showBalance={false} />
    </div>
  );
}
