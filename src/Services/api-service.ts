//! full and final code which show you the 3 choice for all the categories like 3 hotels , 3 restaurants , 3 visiting places
export class ApiService {
  private static GEOAPIFY_API_KEY = "64330fce22f6460d948cc9e1218d7348";
  private static UNSPLASH_ACCESS_KEY = "d27DOYT6tWj3SSy-S-hn-rKodB269qPmuqj7n4wjoX8";

  //? Search the destination based on the given location and get the lon and lat
  static async searchDestinations(query: string): Promise<any[]> {
    if (!query) return [];

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (data?.results) {
      return data.results.map((place: any) => ({
        name: place.name,
        country: place.country,
        lat: place.latitude,
        lon: place.longitude,
      }));
    }
    return [];
  }

  //? This will help us to get the details of the places based on the lat and lon 
  static async getDestinationDetails(lat: number, lon: number): Promise<any[]> {
    try {
      if (!lat || !lon) throw new Error("Invalid coordinates provided.");

      const radius = 8000;
      const perCategoryLimit = 3;

      //? It helps us to find the required feilds from the api and it will provide you the 3 results of each category if the details are present in the API
      const categoryGroups = [
        "tourism.attraction",
        "accommodation.hotel",
        "catering.restaurant",
        "religion.place_of_worship.hinduism,religion.place_of_worship,place_of_worship.temple",
      ];

      const allResults = await Promise.all(
        categoryGroups.map(async (category) => {
          const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(
            category
          )}&filter=circle:${lon},${lat},${radius}&limit=${perCategoryLimit}&apiKey=${
            this.GEOAPIFY_API_KEY
          }`;

          console.log("Fetching Geoapify places:", url);

          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`Geoapify API error (${response.status}) for category ${category}`);
            return [];
          }

          const data = await response.json();
          if (!data.features?.length) {
            console.warn(`No results for category ${category}`);
            return [];
          }

          // ✅ Enrich each category’s results with Unsplash image
          return await Promise.all(
            data.features.map(async (feature: any) => {
              const props = feature.properties;
              const name = props.name || "Unnamed Place";

              const image = await this.fetchImageForPlace(name, props.categories?.join(","));

              return {
                name,
                type: this.mapCategory(props.categories || []),
                address: props.formatted || props.address_line2 || props.city || "Unknown area",
                description: props.name || "Popular tourist spot nearby.",
                image,
                website: props.website || props.datasource?.raw?.website,
                phone: props.contact?.phone || props.datasource?.raw?.phone,
                cost: this.estimateCost(props.categories?.join(",") || ""),
              };
            })
          );
        })
      );

      // Flatten all results and randomize slightly for variety
      return allResults.flat().sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error("Error fetching famous places from Geoapify:", error);
      return [];
    }
  }

  /**
   * 🖼️ Fetch image from Unsplash (fallback: random travel image)
   */
  private static async fetchImageForPlace(placeName: string, category: string = ""): Promise<string> {
    try {
      const query = encodeURIComponent(`${placeName} ${category}`);
      const url = `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&per_page=1&client_id=${this.UNSPLASH_ACCESS_KEY}`;

      const res = await fetch(url);
      const data = await res.json();
      const img = data?.results?.[0]?.urls?.regular;

      if (img) return img;

      // Fallback to category image
      return `https://source.unsplash.com/600x400/?${encodeURIComponent(category || "travel")}`;
    } catch (err) {
      console.warn("Image fetch failed for", placeName, err);
      return "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
    }
  }

  /**
   * 🏷️ Convert categories to readable text
   */
  private static mapCategory(categories: string[]): string {
    const joined = categories.join(",").toLowerCase();

    if (joined.includes("place_of_worship") || joined.includes("temple"))
      return "Temple / Spiritual Place";
    if (joined.includes("hotel") || joined.includes("accommodation"))
      return "Hotel / Stay";
    if (joined.includes("restaurant") || joined.includes("catering"))
      return "Restaurant / Eatery";
    if (joined.includes("attraction") || joined.includes("tourism"))
      return "Tourist Attraction";

    return "Famous Place";
  }

  /**
   * 💰 Rough cost estimates (no logic change)
   */
  private static estimateCost(category: string): number {
    category = category.toLowerCase();
    if (category.includes("hotel")) return 120;
    if (category.includes("restaurant")) return 40;
    if (category.includes("temple") || category.includes("place_of_worship")) return 10;
    if (category.includes("attraction")) return 25;
    return Math.floor(Math.random() * 60) + 10;
  }
}
