'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewOrderPage() {
  const router = useRouter();
  const [sites, setSites] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    siteId: '',
    labId: '',
    kitId: '',
    quantity: 1,
    outboundCarrier: 'UPS',
    sampleCarrier: 'UPS',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sitesRes, labsRes, kitsRes] = await Promise.all([
        fetch('/api/sites?isActive=true'),
        fetch('/api/labs?isActive=true'),
        fetch('/api/kits?isActive=true'),
      ]);

      const [sitesData, labsData, kitsData] = await Promise.all([
        sitesRes.json(),
        labsRes.json(),
        kitsRes.json(),
      ]);

      setSites(sitesData.data || []);
      setLabs(labsData.data || []);
      setKits(kitsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store form data in sessionStorage and navigate to date selection
    sessionStorage.setItem('orderFormData', JSON.stringify(formData));
    router.push('/orders/new/dates');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Order</h1>
          <p className="text-muted-foreground">Create a new sample kit order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Fill in the order information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Site and Outbound Carrier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteId">Site *</Label>
                <select
                  id="siteId"
                  required
                  value={formData.siteId}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select a site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outboundCarrier">Outbound Carrier *</Label>
                <select
                  id="outboundCarrier"
                  required
                  value={formData.outboundCarrier}
                  onChange={(e) => setFormData({ ...formData, outboundCarrier: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                </select>
              </div>
            </div>

            {/* Lab and Sample Carrier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labId">Lab *</Label>
                <select
                  id="labId"
                  required
                  value={formData.labId}
                  onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select a lab</option>
                  {labs.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name} ({lab.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampleCarrier">Sample Carrier *</Label>
                <select
                  id="sampleCarrier"
                  required
                  value={formData.sampleCarrier}
                  onChange={(e) => setFormData({ ...formData, sampleCarrier: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                </select>
              </div>
            </div>

            {/* Kit and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kitId">Kit *</Label>
                <select
                  id="kitId"
                  required
                  value={formData.kitId}
                  onChange={(e) => setFormData({ ...formData, kitId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select a kit</option>
                  {kits.map((kit) => (
                    <option key={kit.id} value={kit.id}>
                      {kit.name} ({kit.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit">
                Next: Select Sampling Dates
              </Button>
              <Link href="/orders">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
