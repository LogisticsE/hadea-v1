import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2">EF-HaDEA</CardTitle>
          <CardDescription className="text-xl">
            HaDEA Order Entry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Comprehensive management of laboratory sample kit shipments, from outbound delivery to sample return.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard" className="block">
              <Button className="w-full h-20 text-lg" size="lg">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/orders" className="block">
              <Button className="w-full h-20 text-lg" variant="outline" size="lg">
                View Orders
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-3">Key Features:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li>✓ Order Management</li>
              <li>✓ Site & Lab Management</li>
              <li>✓ Kit Configuration</li>
              <li>✓ Stock Tracking</li>
              <li>✓ Calendar Scheduling</li>
              <li>✓ Document Generation</li>
              <li>✓ Carrier Integration (UPS/DHL)</li>
              <li>✓ Proof of Delivery</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
