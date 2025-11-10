import { Component, State, h } from '@stencil/core';
import { StorageService } from '../../../Services/storage-service';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {
  @State() selectedDestination: any = null;

  // ✅ Load previous destination if available
  componentWillLoad() {
    const saved = StorageService.loadDestination();
    if (saved) {
      try {
        this.selectedDestination = JSON.parse(saved);
      } catch {
        this.selectedDestination = null;
      }
    }
  }

  // ✅ Handle destination search selection
  handleDestinationSelected(event: CustomEvent<any>) {
    this.selectedDestination = event.detail;

    // Save destination to localStorage
    StorageService.saveDestination(JSON.stringify(this.selectedDestination));
  }

  // ✅ Clear all stored data (destinations + itinerary + budget)
  handleClearAll() {
    if (confirm('Are you sure you want to clear all trip data?')) {
      StorageService.clearAll();
      this.selectedDestination = null;
      window.location.reload();
    }
  }

  render() {
    return (
      <div class="app-container">
        <h1 class="title">Trip Planning Tool</h1>

        {/* Destination Search */}
        <destination-search
          onDestinationSelected={(event) => this.handleDestinationSelected(event)}
        ></destination-search>

        {/* Show selected destination name */}
        {this.selectedDestination && (
          <div class="selected-destination">
            <h2>📍 Selected Destination:</h2>
            <p>
              {this.selectedDestination.name}, {this.selectedDestination.country}
            </p>
          </div>
        )}

        {/* Map Section */}
        <div class="section map-section">
          {this.selectedDestination ? (
            <map-view
              lat={this.selectedDestination.lat}
              lon={this.selectedDestination.lon}
            ></map-view>
          ) : (
            <p class="placeholder-text">
              Search for a destination to view on the map
            </p>
          )}
        </div>

        {/* ✅ Itinerary Builder (Now passes lat/lon props) */}
        <div class="section">
          <itinerary-builder
            lat={this.selectedDestination?.lat}
            lon={this.selectedDestination?.lon}
          ></itinerary-builder>
        </div>

        {/* Budget Tracker */}
        <div class="section">
          <budget-tracker></budget-tracker>
        </div>

        {/* Clear All Button */}
        <div class="button-section">
          <button class="clear-btn" onClick={() => this.handleClearAll()}>
            Clear All Data
          </button>
        </div>
      </div>
    );
  }
}
