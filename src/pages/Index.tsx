import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchVenueStaticData, fetchVenueDynamicData } from "@/services/api";
import { calculateDeliveryPrice } from "@/utils/priceCalculator";

const Index = () => {
  const [venueSlug, setVenueSlug] = useState("home-assignment-venue-helsinki-static"); // Default to Helsinki (Static)
  const [cartValue, setCartValue] = useState<string>("");
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);

  // Extract the base slug and type from venueSlug
  const baseSlug = venueSlug.split("-static").join("").split("-dynamic").join("");

  // Fetch static and dynamic data based on the base slug
  const { data: staticData, error: staticError } = useQuery({
    queryKey: ["staticData", baseSlug],
    queryFn: () => fetchVenueStaticData(baseSlug),
    enabled: !!baseSlug,
  });

  const { data: dynamicData, error: dynamicError } = useQuery({
    queryKey: ["dynamicData", baseSlug],
    queryFn: () => fetchVenueDynamicData(baseSlug),
    enabled: !!baseSlug,
  });

  // Add this after your queries to debug
  useEffect(() => {
    if (staticError) console.error('Static data error:', staticError);
    if (dynamicError) console.error('Dynamic data error:', dynamicError);
    if (staticData) console.log('Static data:', staticData);
    if (dynamicData) console.log('Dynamic data:', dynamicData);
  }, [staticData, dynamicData, staticError, dynamicError]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLatitude(position.coords.latitude);
        setUserLongitude(position.coords.longitude);
        toast.success("Location successfully retrieved");
      },
      (error) => {
        console.error("Error retrieving location:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("The request to get user location timed out.");
            break;
          default:
            toast.error("An unknown error occurred.");
        }
      }
    );
  };

  const handleCalculate = () => {
    try {
      // Strip the "-static" or "-dynamic" suffix from the venueSlug
      const baseVenueSlug = venueSlug.replace(/-static$/, "").replace(/-dynamic$/, "");
  
      // Validate inputs
      if (!staticData || !dynamicData) {
        toast.error("Venue data is not available. Please try again.");
        return;
      }
  
      if (!userLatitude || !userLongitude) {
        toast.error("Please allow access to your location to calculate the delivery price.");
        return;
      }
  
      if (!cartValue || isNaN(parseFloat(cartValue)) || parseFloat(cartValue) < 0) {
        toast.error("Please enter a valid cart value (e.g., 10.50).");
        return;
      }
  
      // Parse cart value to a number
      const cartValueNumber = parseFloat(cartValue);
  
      // Calculate delivery price
      const result = calculateDeliveryPrice(
        cartValueNumber,
        userLatitude,
        userLongitude,
        dynamicData.venue_raw.delivery_specs,
        staticData.venue_raw.location.coordinates
      );
  
      // Set the price breakdown
      setPriceBreakdown(result);
      toast.success("Price calculated successfully!");
    } catch (error) {
      console.error("Error calculating delivery price:", error);
      toast.error(error instanceof Error ? error.message : "Failed to calculate price. Please try again.");
    }
  };

  const handleVenueChange = (value: string) => {
    setVenueSlug(value); // Update venueSlug directly
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="p-6 space-y-6 bg-white shadow-lg">
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Delivery Price Calculator
          </h1>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venueSlug">Venue</Label>
              <select
                id="venueSlug"
                value={venueSlug}
                onChange={(e) => handleVenueChange(e.target.value)}
                className="w-full p-2 border rounded"
                data-test-id="venueSlug"
              >
                <option value="home-assignment-venue-helsinki-static">Helsinki (Static)</option>
                <option value="home-assignment-venue-helsinki-dynamic">Helsinki (Dynamic)</option>
                <option value="home-assignment-venue-tallinn-static">Tallinn (Static)</option>
                <option value="home-assignment-venue-tallinn-dynamic">Tallinn (Dynamic)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cartValue">Cart Value (EUR)</Label>
              <Input
                id="cartValue"
                type="number"
                step="0.01"
                value={cartValue}
                onChange={(e) => setCartValue(e.target.value)}
                placeholder="Enter cart value"
                data-test-id="cartValue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userLatitude">Latitude</Label>
              <Input
                id="userLatitude"
                type="number"
                value={userLatitude ?? ""}
                readOnly
                data-test-id="userLatitude"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userLongitude">Longitude</Label>
              <Input
                id="userLongitude"
                type="number"
                value={userLongitude ?? ""}
                readOnly
                data-test-id="userLongitude"
              />
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleGetLocation}
                className="w-full"
                data-test-id="getLocation"
              >
                Get Current Location
              </Button>
              <Button
                onClick={handleCalculate}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Calculate Price
              </Button>
            </div>
          </div>

          {priceBreakdown && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Price Breakdown</h2>
              <div className="space-y-1">
                <p className="flex justify-between">
                  <span>Cart Value:</span>
                  <span data-raw-value={priceBreakdown.cartValue}>
                    {(priceBreakdown.cartValue / 100).toFixed(2)} EUR
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Small Order Surcharge:</span>
                  <span data-raw-value={priceBreakdown.smallOrderSurcharge}>
                    {(priceBreakdown.smallOrderSurcharge / 100).toFixed(2)} EUR
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span data-raw-value={priceBreakdown.deliveryFee}>
                    {(priceBreakdown.deliveryFee / 100).toFixed(2)} EUR
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Delivery Distance:</span>
                  <span data-raw-value={priceBreakdown.deliveryDistance}>
                    {priceBreakdown.deliveryDistance} m
                  </span>
                </p>
                <div className="border-t pt-2 mt-2">
                  <p className="flex justify-between font-semibold">
                    <span>Total Price:</span>
                    <span data-raw-value={priceBreakdown.totalPrice}>
                      {(priceBreakdown.totalPrice / 100).toFixed(2)} EUR
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;