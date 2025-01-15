import { calculateDeliveryPrice } from '../utils/priceCalculator';

test('calculateDeliveryPrice returns correct total price', () => {
  const result = calculateDeliveryPrice(
    100, // cartValue
    40.7128, // userLatitude
    -74.0060, // userLongitude
    {
      order_minimum_no_surcharge: 5000,
      delivery_pricing: {
        base_price: 200,
        distance_ranges: [
          { min: 0, max: 10000, a: 100, b: 10 },
        ],
      },
    },
    [-73.935242, 40.730610] // venueCoordinates
  );

  expect(result.totalPrice).toBeGreaterThan(0);
});