'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TruckIcon } from 'lucide-react';

export default function TrackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shipment Tracking</h1>
        <p className="text-muted-foreground">Track all shipments in real-time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Shipments</CardTitle>
          <CardDescription>Monitor your in-transit shipments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TruckIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No active shipments to track at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
