import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-medium text-stone-950 shadow-xl border border-amber-400">
      <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shrink-0" />
      <div className="flex-1 flex items-center gap-1.5">
        <WifiOff className="w-3.5 h-3.5 shrink-0" />
        <span>अफलाइन मोड — पुस्तकका सबै सामग्री फोन मेमोरीबाट पढ्दै हुनुहुन्छ।</span>
      </div>
    </div>
  );
};
