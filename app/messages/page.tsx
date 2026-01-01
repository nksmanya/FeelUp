import React, { Suspense } from 'react';
import MessagesClient from './MessagesClient';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading messages...</div>}>
      {/* Client component handles all message UI and hooks */}
      <MessagesClient />
    </Suspense>
  );
}