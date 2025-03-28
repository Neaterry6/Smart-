import React from 'react';
import SpotifyTab from '../components/SpotifyTab';
import { Card } from '@/components/ui/card';

export default function Music() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Study Music</h1>
      <div className="mx-auto max-w-4xl">
        <Card className="p-6">
          <SpotifyTab />
        </Card>
      </div>
    </div>
  );
}