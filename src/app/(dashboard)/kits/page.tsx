'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Box } from 'lucide-react';

export default function KitsPage() {
  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/kits?isActive=true');
      const data = await response.json();
      setKits(data.data || []);
    } catch (error) {
      console.error('Error fetching kits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kits</h1>
          <p className="text-muted-foreground">Manage sample kit configurations</p>
        </div>
        <Link href="/kits/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Kit
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Kits</CardTitle>
          <CardDescription>View and manage kit configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading kits...</div>
          ) : kits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No kits found. Create your first kit to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Dimensions (cm)</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kits.map((kit) => (
                  <TableRow key={kit.id}>
                    <TableCell className="font-medium">{kit.code}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        {kit.name}
                      </span>
                    </TableCell>
                    <TableCell>{kit.items?.length || 0}</TableCell>
                    <TableCell>{kit.totalWeight}</TableCell>
                    <TableCell>
                      {kit.length} × {kit.width} × {kit.height}
                    </TableCell>
                    <TableCell>{kit._count?.orders || 0}</TableCell>
                    <TableCell>
                      <Link href={`/kits/${kit.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
