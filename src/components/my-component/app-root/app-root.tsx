import { Component, State, h } from '@stencil/core';
import { StorageService } from '../../../Services/storage-service';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {
  @State() selectedDestination: any = null;

  // When destination is selected from the search component
  handleDestinationSelected(event: CustomEvent<any>) {
    this.selectedDestination = event.detail;
  }

  // Clears all stored data and resets the app
  handleClearAll() {
    if (confirm('Are you sure you want to clear all trip data?')) {
      StorageService.clearAll();
      this.selectedDestination = null;
      window.location.reload(); // simple way to refresh UI
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
            <h2>Selected Destination:</h2>
            <p>{this.selectedDestination.name}, {this.selectedDestination.country}</p>
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
            <p class="placeholder-text">Search for a destination to view on the map</p>
          )}
        </div>

        {/* Itinerary Builder */}
        <div class="section">
          <itinerary-builder></itinerary-builder>
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
