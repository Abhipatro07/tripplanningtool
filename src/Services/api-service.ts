export class ApiService {
  // Free mock API for demo purposes
  static async searchDestinations(query: string): Promise<any[]> {
    if (!query) return [];

    // Using a free open API for city data (no key)
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}`);
    //* Prevent invalid URL errors
    //* encodeURIComponent(query) is used to:
    //* Safely include spaces, symbols, and Unicode characters(like accents or emojis) in the URL
    //* Avoid wrong API results

    const data = await response.json();

    if (data && data.results) {
      return data.results.map((place: any) => ({
        name: place.name,
        country: place.country,
        lat: place.latitude,
        lon: place.longitude,
      }));
    }   

    return [];
  }
}
