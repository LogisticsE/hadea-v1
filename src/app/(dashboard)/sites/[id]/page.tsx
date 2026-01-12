'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MapPin, Mail, Phone, Building, Globe, Edit, UserPlus } from 'lucide-react';
import { formatDate } from '@/lib/utils/date-utils';

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;
  const [site, setSite] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    isPrimary: false,
  });
  const [addingContact, setAddingContact] = useState(false);

  useEffect(() => {
    if (siteId) {
      fetchSite();
      fetchOrders();
    }
  }, [siteId]);

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/sites/${siteId}`);
      const data = await response.json();
      setSite(data.data);
    } catch (error) {
      console.error('Error fetching site:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?siteId=${siteId}`);
      const data = await response.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingContact(true);

    try {
      const response = await fetch(`/api/sites/${siteId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setContactDialogOpen(false);
        setContactForm({ name: '', email: '', phone: '', department: '', isPrimary: false });
        fetchSite(); // Refresh site data
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact');
    } finally {
      setAddingContact(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading site information...</div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-muted-foreground">
          Site not found.
        </div>
        <Link href="/sites">
          <Button variant="outline">Back to Sites</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/sites">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{site.name}</h1>
          <p className="text-muted-foreground">Site Code: {site.code}</p>
        </div>
        <Link href={`/sites/${siteId}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-medium">{site.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p>
                  {site.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">EU Country</p>
                <p>
                  {site.isEU ? (
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
                    {site.addressLine1}
                    {site.addressLine2 && <>, {site.addressLine2}</>}
                    <br />
                    {site.city}
                    {site.stateProvince && <>, {site.stateProvince}</>} {site.postalCode}
                    <br />
                    {site.countryName}
                  </p>
                </div>
              </div>
            </div>

            {site.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm">{site.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>Created: {formatDate(site.createdAt, 'PPp')}</p>
              <p>Last updated: {formatDate(site.updatedAt, 'PPp')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contacts ({site.contacts?.length || 0})</CardTitle>
                <CardDescription>Site contact persons</CardDescription>
              </div>
              <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Contact</DialogTitle>
                    <DialogDescription>Add a new contact person for this site</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddContact}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Name *</Label>
                        <Input
                          id="contact-name"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Phone</Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-department">Department</Label>
                        <Input
                          id="contact-department"
                          value={contactForm.department}
                          onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="contact-primary"
                          checked={contactForm.isPrimary}
                          onCheckedChange={(checked) => setContactForm({ ...contactForm, isPrimary: checked === true })}
                        />
                        <Label htmlFor="contact-primary" className="cursor-pointer">
                          Set as primary contact
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addingContact}>
                        {addingContact ? 'Adding...' : 'Add Contact'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {site.contacts && site.contacts.length > 0 ? (
              <div className="space-y-4">
                {site.contacts.map((contact: any) => (
                  <div key={contact.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        {contact.department && (
                          <p className="text-sm text-muted-foreground">{contact.department}</p>
                        )}
                      </div>
                      {contact.isPrimary && (
                        <Badge variant="secondary">Primary</Badge>
                      )}
                      {contact.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
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
                No contacts found for this site.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
          <CardDescription>All orders for this site</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Lab</TableHead>
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
                    <TableCell>{order.lab?.name}</TableCell>
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
              No orders found for this site.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
