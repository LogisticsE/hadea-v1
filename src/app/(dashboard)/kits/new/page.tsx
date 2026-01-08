'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function NewKitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    totalWeight: '',
    length: '',
    width: '',
    height: '',
  });
  const [kitItems, setKitItems] = useState<Array<{ stockItemId: string; quantity: number }>>([]);

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    try {
      const response = await fetch('/api/stock?isActive=true');
      const data = await response.json();
      setStockItems(data.data || []);
    } catch (error) {
      console.error('Error fetching stock items:', error);
    }
  };

  const addKitItem = () => {
    setKitItems([...kitItems, { stockItemId: '', quantity: 1 }]);
  };

  const removeKitItem = (index: number) => {
    setKitItems(kitItems.filter((_, i) => i !== index));
  };

  const updateKitItem = (index: number, field: string, value: any) => {
    const updated = [...kitItems];
    updated[index] = { ...updated[index], [field]: value };
    setKitItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalWeight: parseFloat(formData.totalWeight),
          length: parseFloat(formData.length),
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
          items: kitItems.filter(item => item.stockItemId),
        }),
      });

      if (response.ok) {
        router.push('/kits');
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to create kit');
      }
    } catch (error) {
      console.error('Error creating kit:', error);
      alert('Failed to create kit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/kits">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Kit</h1>
          <p className="text-muted-foreground">Create a new kit configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kit Information</CardTitle>
              <CardDescription>Basic kit details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Kit Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Standard Sampling Kit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Kit Code *</Label>
                  <Input
                    id="code"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., KIT-STD-001"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    placeholder="Kit description..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Physical Properties</CardTitle>
              <CardDescription>Dimensions and weight for shipping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalWeight">Total Weight (kg) *</Label>
                  <Input
                    id="totalWeight"
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalWeight}
                    onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })}
                    placeholder="e.g., 0.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Length (cm) *</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    required
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    placeholder="e.g., 30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm) *</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    required
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    placeholder="e.g., 20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Kit Items</CardTitle>
                  <CardDescription>Select stock items to include in this kit</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addKitItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {kitItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items added yet. Click "Add Item" to start building your kit.
                </div>
              ) : (
                <div className="space-y-3">
                  {kitItems.map((item, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`item-${index}`}>Stock Item</Label>
                        <select
                          id={`item-${index}`}
                          value={item.stockItemId}
                          onChange={(e) => updateKitItem(index, 'stockItemId', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          required
                        >
                          <option value="">Select an item</option>
                          {stockItems.map((stock) => (
                            <option key={stock.id} value={stock.id}>
                              {stock.name} ({stock.sku}) - Available: {stock.quantity}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-32 space-y-2">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => updateKitItem(index, 'quantity', parseInt(e.target.value))}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKitItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Kit'}
            </Button>
            <Link href="/kits">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
