'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TruckIcon, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ORDER_STATUS_LABELS } from '@/lib/constants/order-status';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayOutbound: 0,
    inTransit: 0,
    pendingApproval: 0,
    lowStock: 0,
  });
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch orders
      const ordersRes = await fetch('/api/orders?limit=100');
      const ordersData = await ordersRes.json();
      const orders = ordersData.data || [];

      // Fetch stock
      const stockRes = await fetch('/api/stock?lowStock=true');
      const stockData = await stockRes.json();
      const lowStockItems = stockData.data || [];

      // Calculate stats
      const todayOutbound = orders.filter((o: any) => 
        format(new Date(o.outboundShipDate), 'yyyy-MM-dd') === today && 
        ['APPROVED', 'OUTBOUND_PREPARING'].includes(o.status)
      ).length;

      const inTransit = orders.filter((o: any) => 
        ['OUTBOUND_SHIPPED', 'IN_TRANSIT', 'SAMPLE_SHIPPED'].includes(o.status)
      ).length;

      const pendingApproval = orders.filter((o: any) => 
        o.status === 'PENDING_APPROVAL'
      ).length;

      setStats({
        todayOutbound,
        inTransit,
        pendingApproval,
        lowStock: lowStockItems.length,
      });

      // Today's orders
      const todayOrdersList = orders.filter((o: any) => 
        format(new Date(o.outboundShipDate), 'yyyy-MM-dd') === today
      );
      setTodayOrders(todayOrdersList);

      // Recent orders
      const recent = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentOrders(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your logistics operations</p>
        </div>
        <div className="text-center py-8">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your logistics operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Outbound</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOutbound}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayOutbound === 1 ? 'Shipment' : 'Shipments'} to process
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">Active shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground">Orders awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Items below minimum</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Workload */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Outbound Shipments</CardTitle>
            <CardDescription>Shipments scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todayOrders.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No outbound shipments scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {todayOrders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.site?.name} → {order.lab?.name}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.kit?.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest order activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No orders yet. Create your first order to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.site?.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(order.samplingDate), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {stats.lowStock > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              You have {stats.lowStock} item{stats.lowStock !== 1 ? 's' : ''} below minimum stock level.
            </p>
            <Link href="/stock?lowStock=true">
              <span className="text-sm text-blue-600 hover:underline">View low stock items →</span>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
