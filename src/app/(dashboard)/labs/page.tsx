'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FlaskConical } from 'lucide-react';

export default function LabsPage() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/labs?isActive=true');
      const data = await response.json();
      setLabs(data.data || []);
    } catch (error) {
      console.error('Error fetching labs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laboratories</h1>
          <p className="text-muted-foreground">Manage destination laboratories</p>
        </div>
        <Link href="/labs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Lab
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Laboratories</CardTitle>
          <CardDescription>View and manage laboratories</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading laboratories...</div>
          ) : labs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No laboratories found. Create your first lab to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>EU</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labs.map((lab) => (
                  <TableRow key={lab.id}>
                    <TableCell className="font-medium">{lab.code}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4" />
                        {lab.name}
                      </span>
                    </TableCell>
                    <TableCell>{lab.city}</TableCell>
                    <TableCell>{lab.countryName}</TableCell>
                    <TableCell>
                      {lab.isEU ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-600">No</span>
                      )}
                    </TableCell>
                    <TableCell>{lab.contacts?.length || 0}</TableCell>
                    <TableCell>{lab._count?.orders || 0}</TableCell>
                    <TableCell>
                      <Link href={`/labs/${lab.id}`}>
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
