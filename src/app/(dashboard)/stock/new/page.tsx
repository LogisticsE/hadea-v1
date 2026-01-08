'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewStockItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: '0',
    minStockLevel: '0',
    unitPrice: '',
    unitWeight: '',
    length: '',
    width: '',
    height: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          minStockLevel: parseInt(formData.minStockLevel),
          unitPrice: parseFloat(formData.unitPrice),
          unitWeight: parseFloat(formData.unitWeight),
          length: formData.length ? parseFloat(formData.length) : undefined,
          width: formData.width ? parseFloat(formData.width) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
        }),
      });

      if (response.ok) {
        router.push('/stock');
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to create stock item');
      }
    } catch (error) {
      console.error('Error creating stock item:', error);
      alert('Failed to create stock item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/stock">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Stock Item</h1>
          <p className="text-muted-foreground">Add a new item to inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Stock Item Information</CardTitle>
            <CardDescription>Enter the item details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sample Tube 10ml"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  placeholder="e.g., TUBE-10ML-001"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  placeholder="Item description..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (EUR) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="e.g., 2.50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitWeight">Unit Weight (kg) *</Label>
                <Input
                  id="unitWeight"
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  value={formData.unitWeight}
                  onChange={(e) => setFormData({ ...formData, unitWeight: e.target.value })}
                  placeholder="e.g., 0.015"
                />
              </div>

              <div className="col-span-2">
                <h3 className="text-sm font-medium mb-3">Dimensions (optional)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Stock Item'}
              </Button>
              <Link href="/stock">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
