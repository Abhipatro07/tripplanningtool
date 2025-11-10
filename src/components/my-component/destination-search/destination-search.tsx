import { Component, State, Event, EventEmitter, h } from '@stencil/core';
import { ApiService } from '../../../Services/api-service';
import { StorageService } from '../../../Services/storage-service'; 

@Component({
  tag: 'destination-search',
  styleUrl: 'destination-search.css',
  shadow: true,
})
export class DestinationSearch {
  @State() query: string = '';
  @State() results: any[] = [];
  @Event() destinationSelected: EventEmitter<any>;

  async componentWillLoad() {
    //! Load last selected destination from localStorage (if any)
    //* Runs once before the component renders.
    //* Loads the last destination from localStorage(if it exists).
    //* Emits that destination so that other components(like map and itinerary) are preloaded.
    //* Updates query with that destination name(shows in input box).
    const savedDestination = StorageService.loadDestination();
    if (savedDestination) {
      try {
        const parsed = JSON.parse(savedDestination);
        this.query = parsed.name || '';
        //! Optionally auto-emit the previously selected destination
        this.destinationSelected.emit(parsed);
      } catch (e) {
        console.warn('Invalid saved destination format');
      }
    }
  }

  async handleSearch() {
  //* Called when the user clicks the Search button.
  //* → which queries Open-Meteo’s geocoding API.
  //* Sends a request to ApiService.searchDestinations()
  //* The response returns an array of cities matching that query:
    if (this.query.trim().length === 0) {
      this.results = [];
      return;
    }

    try {
      const data = await ApiService.searchDestinations(this.query);
      this.results = data;
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  }

  handleSelect(destination: any) {
    //* When the user clicks a search result:
    //* Saves it permanently to localStorage.
    //* Emits the selected destination up to <app-root> using destinationSelected.
    //* Updates the search box with the chosen name.
    //* Clears the search results list.
    StorageService.saveDestination(JSON.stringify(destination));
    this.destinationSelected.emit(destination);
    this.query = destination.name;
    this.results = [];
  }

  render() {
    return (
      <div class="destination-search">
        <div class="search-bar">
          <input
            type="text"
            value={this.query}
            placeholder="Search for a destination..."
            onInput={(e: any) => (this.query = e.target.value)}
            class="search-input"
          />
          <button class="search-btn" onClick={() => this.handleSearch()}>
            Search
          </button>
        </div>

        {this.results.length > 0 && (
          <ul class="results-list">
            {this.results.map((place) => (
              <li class="result-item" onClick={() => this.handleSelect(place)}>
                <span class="place-name">{place.name}</span>
                <span class="country-name">{place.country}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}
