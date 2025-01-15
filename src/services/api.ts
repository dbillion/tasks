import {
  VENUE_STATIC_HELSINKI,
  VENUE_STATIC_TALLINN,
  VENUE_DYNAMIC_HELSINKI,
  VENUE_DYNAMIC_TALLINN,
} from '@/data/mockVenueData';

export const fetchVenueStaticData = async (venueSlug: string) => {
  // Strip the "-static" or "-dynamic" suffix from the venueSlug
  const baseVenueSlug = venueSlug.replace(/-static$/, "").replace(/-dynamic$/, "");

  let data;

  switch (baseVenueSlug) {
    case 'home-assignment-venue-helsinki':
      data =  VENUE_STATIC_HELSINKI;
      break;
    case 'home-assignment-venue-tallinn':
      data = VENUE_STATIC_TALLINN;
      break;
    default:
      throw new Error(`Venue slug "${venueSlug}" not found in static data.`);
  }

  console.log("Fetched Dynamic Data:", JSON.stringify(data, null, 2)); 

  return data;
};

export const fetchVenueDynamicData = async (venueSlug: string) => {
  // Strip the "-static" or "-dynamic" suffix from the venueSlug
  const baseVenueSlug = venueSlug.replace(/-static$/, "").replace(/-dynamic$/, "");

  let data;

  switch (baseVenueSlug) {
    case 'home-assignment-venue-helsinki':
      data =VENUE_DYNAMIC_HELSINKI;
     
      break;
    case 'home-assignment-venue-tallinn':
      data =  VENUE_DYNAMIC_TALLINN;
      break;
    default:
      throw new Error(`Venue slug "${venueSlug}" not found in dynamic data.`);
  }


  console.log("Fetched Static Data:", JSON.stringify(data, null, 2)); // Log the static data
  return data;
};