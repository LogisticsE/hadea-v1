'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils/date-utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants/order-status';
import { format, isSameDay, parseISO } from 'date-fns';

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const filterDate = searchParams.get('date');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const color = ORDER_STATUS_COLORS[status] || 'gray';
    const variants: Record<string, any> = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
    };
    return variants[color] || variants.gray;
  };

  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.site?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.lab?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter (if date param is present)
    if (filterDate) {
      const filterDateObj = parseISO(filterDate);
      const matchesDate = 
        isSameDay(parseISO(order.samplingDate), filterDateObj) ||
        isSameDay(parseISO(order.outboundShipDate), filterDateObj);
      return matchesSearch && matchesDate;
    }
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            {filterDate 
              ? `Orders for ${format(parseISO(filterDate), 'MMMM d, yyyy')}`
              : 'Manage sample kit orders'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {filterDate && (
            <Link href="/orders">
              <Button variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Clear Date Filter
              </Button>
            </Link>
          )}
          <Link href="/orders/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found. Create your first order to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Lab</TableHead>
                  <TableHead>Kit</TableHead>
                  <TableHead>Sampling Date</TableHead>
                  <TableHead>Outbound Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.site?.name}</TableCell>
                    <TableCell>{order.lab?.name}</TableCell>
                    <TableCell>{order.kit?.name}</TableCell>
                    <TableCell>{formatDate(order.samplingDate, 'PP')}</TableCell>
                    <TableCell>{formatDate(order.outboundShipDate, 'PP')}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/orders/${order.id}`}>
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

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">Manage sample kit orders</p>
          </div>
        </div>
        <Card>
          <CardContent>
            <div className="text-center py-8">Loading orders...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
