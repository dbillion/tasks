interface DeliveryRange {
  min: number;
  max: number;
  a: number;
  b: number;
}

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters, rounded to nearest integer
};

export const calculateDeliveryPrice = (
  cartValue: number,
  userLatitude: number,
  userLongitude: number,
  deliverySpecs: {
    order_minimum_no_surcharge: number;
    delivery_pricing: {
      base_price: number;
      distance_ranges: DeliveryRange[];
    };
  },
  venueCoordinates: [number, number]
) => {
  const [venueLongitude, venueLatitude] = venueCoordinates;

  // Calculate distance between user and venue
  const distance = calculateDistance(userLatitude, userLongitude, venueLatitude, venueLongitude);

  // Convert cart value to cents
  const cartValueInCents = Math.round(cartValue * 100);

  // Calculate small order surcharge
  const smallOrderSurcharge = Math.max(0, deliverySpecs.order_minimum_no_surcharge - cartValueInCents);

  // Find applicable distance range
  const range = deliverySpecs.delivery_pricing.distance_ranges.find(
    (r) => distance >= r.min && (r.max === 0 || distance < r.max)
  );

  if (!range || range.max === 0) {
    throw new Error("Delivery not available for this distance.");
  }

  // Calculate delivery fee
  const distanceComponent = range.b > 0 ? Math.round((range.b * distance) / 10) : 0;
  const deliveryFee = deliverySpecs.delivery_pricing.base_price + range.a + distanceComponent;

  return {
    cartValue: cartValueInCents,
    smallOrderSurcharge,
    deliveryFee,
    deliveryDistance: distance,
    totalPrice: cartValueInCents + smallOrderSurcharge + deliveryFee,
  };
};