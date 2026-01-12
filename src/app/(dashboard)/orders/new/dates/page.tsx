'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isBefore, startOfToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function SelectDatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [kits, setKits] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    // Retrieve form data from previous step
    const storedData = sessionStorage.getItem('orderFormData');
    if (!storedData) {
      router.push('/orders/new');
      return;
    }
    setFormData(JSON.parse(storedData));
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

  const toggleDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingIndex = selectedDates.findIndex(d => format(d, 'yyyy-MM-dd') === dateStr);
    
    if (existingIndex >= 0) {
      setSelectedDates(selectedDates.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const removeDate = (index: number) => {
    setSelectedDates(selectedDates.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      alert('Please select at least one sampling date');
      return;
    }

    setLoading(true);

    try {
      // Get contacts from selected site and lab
      const site = sites.find(s => s.id === formData.siteId);
      const lab = labs.find(l => l.id === formData.labId);

      const siteContactId = site?.contacts?.[0]?.id;
      const labContactId = lab?.contacts?.[0]?.id;

      if (!siteContactId || !labContactId) {
        alert('Selected site or lab must have at least one contact');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          siteContactId,
          labContactId,
          samplingDates: selectedDates.map(d => format(d, 'yyyy-MM-dd')),
        }),
      });

      if (response.ok) {
        sessionStorage.removeItem('orderFormData');
        router.push('/orders');
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to create orders');
      }
    } catch (error) {
      console.error('Error creating orders:', error);
      alert('Failed to create orders');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  const site = sites.find(s => s.id === formData.siteId);
  const lab = labs.find(l => l.id === formData.labId);
  const kit = kits.find(k => k.id === formData.kitId);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = startOfToday();

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const isDateSelected = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders/new">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Select Sampling Dates</h1>
          <p className="text-muted-foreground">Choose one or multiple dates for sampling</p>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Site:</span>{' '}
              <span className="font-medium">{site?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Outbound Carrier:</span>{' '}
              <span className="font-medium">{formData.outboundCarrier}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Lab:</span>{' '}
              <span className="font-medium">{lab?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sample Carrier:</span>{' '}
              <span className="font-medium">{formData.sampleCarrier}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Kit:</span>{' '}
              <span className="font-medium">{kit?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Quantity:</span>{' '}
              <span className="font-medium">{formData.quantity}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Dates */}
      {selectedDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Dates ({selectedDates.length})</CardTitle>
            <CardDescription>Click to remove a date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .map((date, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 pr-1"
                    onClick={() => removeDate(index)}
                  >
                    {format(date, 'MMM d, yyyy')}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold p-2 text-muted-foreground">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isPast = isBefore(day, today);
              const isSelected = isDateSelected(day);

              return (
                <button
                  key={index}
                  type="button"
                  disabled={isPast || !isCurrentMonth}
                  onClick={() => toggleDate(day)}
                  className={`
                    min-h-[60px] border rounded-lg p-2 text-sm transition-colors font-medium flex items-center justify-center
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
                    ${isPast && isCurrentMonth ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                    ${isToday && !isSelected ? 'ring-2 ring-blue-500' : ''}
                    ${isSelected ? 'bg-blue-600 hover:bg-blue-700 border-blue-700 shadow-md' : ''}
                    ${!isPast && !isSelected && isCurrentMonth ? 'hover:bg-blue-50 cursor-pointer hover:border-blue-300' : ''}
                  `}
                >
                  <span className={`${isSelected ? 'text-white font-bold' : 'text-inherit'}`}>
                    {format(day, 'd')}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• Click on a date to select it</p>
            <p>• Click again to deselect</p>
            <p>• You can select multiple dates to create multiple orders</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSubmit} 
          disabled={loading || selectedDates.length === 0}
        >
          {loading 
            ? 'Creating Orders...' 
            : `Create ${selectedDates.length} Order${selectedDates.length !== 1 ? 's' : ''}`
          }
        </Button>
        <Link href="/orders/new">
          <Button type="button" variant="outline">Back</Button>
        </Link>
        <Link href="/orders">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}
