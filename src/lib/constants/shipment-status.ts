export const SHIPMENT_STATUS = {
  PENDING: 'PENDING',
  LABEL_CREATED: 'LABEL_CREATED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  EXCEPTION: 'EXCEPTION',
  CANCELLED: 'CANCELLED',
} as const;

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  LABEL_CREATED: 'Label Created',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception',
  CANCELLED: 'Cancelled',
};
