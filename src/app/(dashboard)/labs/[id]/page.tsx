'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FlaskConical, Mail, Phone, Building, Globe, Edit, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-utils';

export default function LabDetailPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.id as string;
  const [lab, setLab] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (labId) {
      fetchLab();
      fetchOrders();
    }
  }, [labId]);

  const fetchLab = async () => {
    try {
      const response = await fetch(`/api/labs/${labId}`);
      const data = await response.json();
      setLab(data.data);
    } catch (error) {
      console.error('Error fetching lab:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?labId=${labId}`);
      const data = await response.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading lab information...</div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-muted-foreground">
          Lab not found.
        </div>
        <Link href="/labs">
          <Button variant="outline">Back to Labs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/labs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">{lab.name}</h1>
              <p className="text-muted-foreground">Lab Code: {lab.code}</p>
            </div>
          </div>
        </div>
        <Link href={`/labs/${labId}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lab Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Laboratory Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-medium">{lab.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p>
                  {lab.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">EU Country</p>
                <p>
                  {lab.isEU ? (
                    <Badge className="bg-blue-100 text-blue-800">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {lab.addressLine1}
                    {lab.addressLine2 && <>, {lab.addressLine2}</>}
                    <br />
                    {lab.city}
                    {lab.stateProvince && <>, {lab.stateProvince}</>} {lab.postalCode}
                    <br />
                    {lab.countryName}
                  </p>
                </div>
              </div>
            </div>

            {lab.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm">{lab.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>Created: {formatDate(lab.createdAt, 'PPp')}</p>
              <p>Last updated: {formatDate(lab.updatedAt, 'PPp')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card>
          <CardHeader>
            <CardTitle>Contacts ({lab.contacts?.length || 0})</CardTitle>
            <CardDescription>Laboratory contact persons</CardDescription>
          </CardHeader>
          <CardContent>
            {lab.contacts && lab.contacts.length > 0 ? (
              <div className="space-y-4">
                {lab.contacts.map((contact: any) => (
                  <div key={contact.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        {contact.department && (
                          <p className="text-sm text-muted-foreground">{contact.department}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {contact.isPrimary && (
                          <Badge variant="secondary">Primary</Badge>
                        )}
                        {contact.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No contacts found for this laboratory.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
          <CardDescription>All orders for this laboratory</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Kit</TableHead>
                  <TableHead>Sampling Date</TableHead>
                  <TableHead>Outbound Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.site?.name}</TableCell>
                    <TableCell>{order.kit?.name}</TableCell>
                    <TableCell>{formatDate(order.samplingDate, 'PP')}</TableCell>
                    <TableCell>{formatDate(order.outboundShipDate, 'PP')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.status}</Badge>
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for this laboratory.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
