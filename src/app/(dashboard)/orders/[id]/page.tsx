'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Package, MapPin, FlaskConical, Calendar, Truck, FileText, Box, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants/order-status';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      const data = await response.json();
      setOrder(data.data);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError(error.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const color = ORDER_STATUS_COLORS[status] || 'gray';
    const variants: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
    };
    return variants[color] || variants.gray;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle2 className="h-4 w-4" />;
    if (status === 'CANCELLED') return <XCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link href="/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const outboundShipment = order.shipments?.find((s: any) => s.type === 'OUTBOUND');
  const sampleShipment = order.shipments?.find((s: any) => s.type === 'SAMPLE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
            <p className="text-muted-foreground">Order Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(order.status)} text-sm px-3 py-1 flex items-center gap-1`}>
            {getStatusIcon(order.status)}
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{order.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sampling Date</p>
                <p className="font-medium">{formatDate(order.samplingDate, 'PP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outbound Ship Date</p>
                <p className="font-medium">{formatDate(order.outboundShipDate, 'PP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outbound Carrier</p>
                <p className="font-medium">{order.outboundCarrier}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sample Carrier</p>
                <p className="font-medium">{order.sampleCarrier}</p>
              </div>
            </div>
            {order.requiresCustomsDocs && (
              <div className="pt-4 border-t">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Requires Customs Documents
                </Badge>
              </div>
            )}
            {order.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>Created: {formatDate(order.createdAt, 'PPp')}</p>
              {order.updatedAt && <p>Updated: {formatDate(order.updatedAt, 'PPp')}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Site Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Site Name</p>
              <p className="font-medium">{order.site?.name}</p>
              <p className="text-sm text-muted-foreground">{order.site?.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="text-sm">
                {order.site?.addressLine1}
                {order.site?.addressLine2 && <>, {order.site.addressLine2}</>}
                <br />
                {order.site?.city}
                {order.site?.stateProvince && <>, {order.site.stateProvince}</>} {order.site?.postalCode}
                <br />
                {order.site?.countryName}
              </p>
            </div>
            {order.siteContact && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Contact</p>
                <p className="font-medium">{order.siteContact.name}</p>
                <p className="text-sm text-muted-foreground">{order.siteContact.email}</p>
                {order.siteContact.phone && (
                  <p className="text-sm text-muted-foreground">{order.siteContact.phone}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lab Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Laboratory Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Lab Name</p>
              <p className="font-medium">{order.lab?.name}</p>
              <p className="text-sm text-muted-foreground">{order.lab?.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="text-sm">
                {order.lab?.addressLine1}
                {order.lab?.addressLine2 && <>, {order.lab.addressLine2}</>}
                <br />
                {order.lab?.city}
                {order.lab?.stateProvince && <>, {order.lab.stateProvince}</>} {order.lab?.postalCode}
                <br />
                {order.lab?.countryName}
              </p>
            </div>
            {order.labContact && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Contact</p>
                <p className="font-medium">{order.labContact.name}</p>
                <p className="text-sm text-muted-foreground">{order.labContact.email}</p>
                {order.labContact.phone && (
                  <p className="text-sm text-muted-foreground">{order.labContact.phone}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Kit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Kit Name</p>
              <p className="font-medium">{order.kit?.name}</p>
              <p className="text-sm text-muted-foreground">{order.kit?.code}</p>
            </div>
            {order.kit?.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{order.kit.description}</p>
              </div>
            )}
            {order.kit?.items && order.kit.items.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Kit Items</p>
                <div className="space-y-2">
                  {order.kit.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.stockItem?.name} ({item.stockItem?.sku})</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shipments */}
      {(outboundShipment || sampleShipment) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {outboundShipment && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Outbound Shipment</h3>
                    <Badge variant="outline">{outboundShipment.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tracking Number</p>
                      <p className="font-medium">{outboundShipment.trackingNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Scheduled Date</p>
                      <p className="font-medium">{formatDate(outboundShipment.scheduledShipDate, 'PP')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Carrier</p>
                      <p className="font-medium">{outboundShipment.carrier}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium">{outboundShipment.status}</p>
                    </div>
                  </div>
                  {outboundShipment.trackingEvents && outboundShipment.trackingEvents.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Tracking Events</p>
                      <div className="space-y-2">
                        {outboundShipment.trackingEvents.slice(0, 5).map((event: any) => (
                          <div key={event.id} className="flex justify-between text-sm">
                            <span>{event.eventDescription}</span>
                            <span className="text-muted-foreground">{formatDate(event.eventDate, 'PPp')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {sampleShipment && (
                <div className={outboundShipment ? 'pt-6 border-t' : ''}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Sample Shipment</h3>
                    <Badge variant="outline">{sampleShipment.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tracking Number</p>
                      <p className="font-medium">{sampleShipment.trackingNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Scheduled Date</p>
                      <p className="font-medium">{formatDate(sampleShipment.scheduledShipDate, 'PP')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Carrier</p>
                      <p className="font-medium">{sampleShipment.carrier}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium">{sampleShipment.status}</p>
                    </div>
                  </div>
                  {sampleShipment.trackingEvents && sampleShipment.trackingEvents.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Tracking Events</p>
                      <div className="space-y-2">
                        {sampleShipment.trackingEvents.slice(0, 5).map((event: any) => (
                          <div key={event.id} className="flex justify-between text-sm">
                            <span>{event.eventDescription}</span>
                            <span className="text-muted-foreground">{formatDate(event.eventDate, 'PPp')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {order.documents && order.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({order.documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.documents.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell className="font-medium">{doc.fileName}</TableCell>
                    <TableCell>{formatDate(doc.generatedAt, 'PPp')}</TableCell>
                    <TableCell>{(doc.fileSize / 1024).toFixed(2)} KB</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
        {order.status === 'DRAFT' && (
          <Button onClick={() => router.push(`/orders/${orderId}/edit`)}>
            Edit Order
          </Button>
        )}
      </div>
    </div>
  );
}
