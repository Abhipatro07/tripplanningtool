export class StorageService {
  private static DEST_KEY = 'trip_destination';
  private static ITINERARY_KEY = 'trip_itinerary';
  private static BUDGET_KEY = 'trip_budget';

  //! Save functions
  static saveDestination(destination: string) {
    localStorage.setItem(this.DEST_KEY, destination);
  }

  static saveItinerary(itinerary: any[]) {
    localStorage.setItem(this.ITINERARY_KEY, JSON.stringify(itinerary));
  }

  static saveBudget(budget: any[]) {
    localStorage.setItem(this.BUDGET_KEY, JSON.stringify(budget));
  }

  //! Load functions
  static loadDestination(): string {
    return localStorage.getItem(this.DEST_KEY) || '';
  }

  static loadItinerary(): any[] {
    const data = localStorage.getItem(this.ITINERARY_KEY);
    return data ? JSON.parse(data) : [];
  }

  static loadBudget(): any[] {
    const data = localStorage.getItem(this.BUDGET_KEY);
    return data ? JSON.parse(data) : [];
  }

  //! Clear all
  static clearAll() {
    localStorage.removeItem(this.DEST_KEY);
    localStorage.removeItem(this.ITINERARY_KEY);
    localStorage.removeItem(this.BUDGET_KEY);
  }
}


