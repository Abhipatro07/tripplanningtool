import { Component, State, h } from '@stencil/core';
import { StorageService } from '../../../Services/storage-service';

interface ItineraryEvent {
  name: string;
  completed: boolean;
}

@Component({
  tag: 'itinerary-builder',
  styleUrl: 'itinerary-builder.css',
  shadow: true,
})
export class ItineraryBuilder {
  @State() events: ItineraryEvent[] = [];
  @State() newEvent: string = '';

  componentWillLoad() {
    const savedEvents = StorageService.loadItinerary();
    if (savedEvents && savedEvents.length > 0) {
      this.events = savedEvents;
    }
  }

  handleAddEvent() {
    if (this.newEvent.trim()) {
      const updatedEvents = [...this.events, { name: this.newEvent, completed: false }];
      this.events = updatedEvents;
      this.newEvent = '';
      StorageService.saveItinerary(updatedEvents);
    }
  }

  handleRemoveEvent(index: number) {
    const updatedEvents = this.events.filter((_, i) => i !== index);
    this.events = updatedEvents;
    StorageService.saveItinerary(updatedEvents);
  }

  handleToggleComplete(index: number) {
    const updatedEvents = this.events.map((event, i) =>
      i === index ? { ...event, completed: !event.completed } : event
    );
    this.events = updatedEvents;
    StorageService.saveItinerary(updatedEvents);
  }

  render() {
    return (
      <div class="itinerary">
        <h2 class="section-title">Itinerary</h2>

        <div class="input-group">
          <input
            type="text"
            value={this.newEvent}
            placeholder="Add new activity..."
            onInput={(e) => (this.newEvent = (e.target as HTMLInputElement).value)}
            class="input-field"
          />
          <button class="add-btn" onClick={() => this.handleAddEvent()}>
            Add
          </button>
        </div>

        <div class="timeline">
          {this.events.map((event, index) => (
            <div
              class={{
                'event-card': true,
                completed: event.completed,
              }}
              onClick={() => this.handleToggleComplete(index)}
            >
              <div class="event-content">
                <span class="event-title">
                  {event.completed ? `${event.name}` : event.name}
                </span>
                <button
                  class="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleRemoveEvent(index);
                  }}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    );
  }
}
