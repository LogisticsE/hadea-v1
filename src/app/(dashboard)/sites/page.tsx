'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, MapPin } from 'lucide-react';

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sites?isActive=true');
      const data = await response.json();
      setSites(data.data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-muted-foreground">Manage sampling sites</p>
        </div>
        <Link href="/sites/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Site
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sites</CardTitle>
          <CardDescription>View and manage sampling sites</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading sites...</div>
          ) : sites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sites found. Create your first site to get started.
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
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.code}</TableCell>
                    <TableCell>{site.name}</TableCell>
                    <TableCell>{site.city}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {site.countryName}
                      </span>
                    </TableCell>
                    <TableCell>
                      {site.isEU ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-600">No</span>
                      )}
                    </TableCell>
                    <TableCell>{site.contacts?.length || 0}</TableCell>
                    <TableCell>{site._count?.orders || 0}</TableCell>
                    <TableCell>
                      <Link href={`/sites/${site.id}`}>
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
