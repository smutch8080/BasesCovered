import { Location } from '../types/team';

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Load Google Maps JavaScript API
async function loadGoogleMapsScript(): Promise<void> {
  if (!API_KEY) {
    console.warn('No Google Maps API key found, using mock data');
    return;
  }

  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    // Create script element with async loading
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      reject(new Error('Failed to load Google Maps script'));
    };
    document.head.appendChild(script);
  });
}

// Mock data for development/fallback
const mockCities: Location[] = [
  { placeId: '1', city: 'San Francisco', state: 'CA', country: 'USA', address: 'San Francisco, CA' },
  { placeId: '2', city: 'Los Angeles', state: 'CA', country: 'USA', address: 'Los Angeles, CA' },
  { placeId: '3', city: 'New York', state: 'NY', country: 'USA', address: 'New York, NY' },
  { placeId: '4', city: 'Chicago', state: 'IL', country: 'USA', address: 'Chicago, IL' },
  { placeId: '5', city: 'Houston', state: 'TX', country: 'USA', address: 'Houston, TX' }
];

export async function searchPlaces(query: string): Promise<Location[]> {
  if (!query || query.length < 2) return [];

  try {
    // If no API key, use mock data
    if (!API_KEY) {
      console.warn('No Google Maps API key found. Using mock data for development.');
      return mockCities.filter(place => 
        place.city.toLowerCase().includes(query.toLowerCase()) ||
        place.state.toLowerCase().includes(query.toLowerCase())
      );
    }

    await loadGoogleMapsScript();

    const service = new google.maps.places.AutocompleteService();
    const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
      service.getPlacePredictions(
        {
          input: query,
          types: ['(cities)'],
          componentRestrictions: { country: 'us' }
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      );
    });

    if (!predictions.length) {
      return mockCities.filter(place => 
        place.city.toLowerCase().includes(query.toLowerCase()) ||
        place.state.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Create a dummy div for PlacesService (required by Google Maps API)
    const placesDiv = document.createElement('div');
    const placesService = new google.maps.places.PlacesService(placesDiv);

    // Get details for each prediction
    const places = await Promise.all(
      predictions.map(prediction => 
        new Promise<Location | null>((resolve) => {
          placesService.getDetails(
            {
              placeId: prediction.place_id,
              fields: ['address_components', 'formatted_address']
            },
            (result, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                const components = result.address_components || [];
                let city = '', state = '', country = '';

                for (const component of components) {
                  if (component.types.includes('locality')) {
                    city = component.long_name;
                  } else if (component.types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                  } else if (component.types.includes('country')) {
                    country = component.long_name;
                  }
                }

                resolve({
                  placeId: prediction.place_id,
                  city,
                  state,
                  country,
                  address: `${city}, ${state}`
                });
              } else {
                resolve(null);
              }
            }
          );
        })
      )
    );

    const validPlaces = places.filter((place): place is Location => place !== null);
    
    // If no results from API, fall back to mock data
    if (validPlaces.length === 0) {
      return mockCities.filter(place => 
        place.city.toLowerCase().includes(query.toLowerCase()) ||
        place.state.toLowerCase().includes(query.toLowerCase())
      );
    }

    return validPlaces;
  } catch (error) {
    console.error('Error searching places:', error);
    // Fallback to mock data if API fails
    return mockCities.filter(place => 
      place.city.toLowerCase().includes(query.toLowerCase()) ||
      place.state.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Add type declaration for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}