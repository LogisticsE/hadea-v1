'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, AlertTriangle } from 'lucide-react';

export default function StockPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    fetchStock();
  }, [showLowStock]);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const url = showLowStock ? '/api/stock?lowStock=true' : '/api/stock?isActive=true';
      const response = await fetch(url);
      const data = await response.json();
      setStock(data.data || []);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (item: any) => item.quantity <= item.minStockLevel;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground">Track and manage inventory</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showLowStock ? 'default' : 'outline'}
            onClick={() => setShowLowStock(!showLowStock)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Low Stock
          </Button>
          <Link href="/stock/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Item
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{showLowStock ? 'Low Stock Items' : 'All Stock Items'}</CardTitle>
          <CardDescription>View and manage stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading stock...</div>
          ) : stock.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {showLowStock 
                ? 'No low stock items found.'
                : 'No stock items found. Create your first item to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Used in Kits</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stock.map((item) => (
                  <TableRow key={item.id} className={isLowStock(item) ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.name}
                        {isLowStock(item) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={isLowStock(item) ? 'text-red-600 font-bold' : ''}>
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{item.minStockLevel}</TableCell>
                    <TableCell>€{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{item.unitWeight}</TableCell>
                    <TableCell>{item._count?.kitItems || 0}</TableCell>
                    <TableCell>
                      <Link href={`/stock/${item.id}`}>
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
