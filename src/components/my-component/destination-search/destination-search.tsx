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
