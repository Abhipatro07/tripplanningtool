import { Component, State, Prop, h, Watch } from '@stencil/core';
import { StorageService } from '../../../Services/storage-service';
import { ApiService } from '../../../Services/api-service';

interface ItineraryEvent {
  name: string;
  completed: boolean;
  cost?: number;
  address?: string;
  description?: string;
  image: string;
}

@Component({
  tag: 'itinerary-builder',
  styleUrl: 'itinerary-builder.css',
  shadow: true,
})
export class ItineraryBuilder {
  @Prop() lat: number | null = null;
  @Prop() lon: number | null = null;

  @State() events: ItineraryEvent[] = [];
  @State() newEvent: string = '';
  @State() newEventCost: number = 0; // ✅ New state for custom cost
  @State() suggestions: any[] = [];
  @State() loading: boolean = false;

  async componentWillLoad() {
    const savedEvents = StorageService.loadItinerary();
    if (savedEvents?.length > 0) this.events = savedEvents;

    if (this.lat && this.lon) await this.fetchSuggestions();

    // 🔁 Listen for budget updates
    window.addEventListener('budgetUpdated', () => {
      this.syncWithBudget();
    });
  }

  private syncWithBudget() {
    //* Fetches the budget list from localStorage.
    //* If an itinerary item name matches a budget item name → updates its cost.
    //* Keeps both itinerary and budget consistent automatically.
    const budget = StorageService.loadBudget();
    const updatedEvents = this.events.map((event) => {
      const match = budget.find((b) => b.name === event.name);
      if (match) return { ...event, cost: match.amount };
      return event;
    });
    this.events = updatedEvents;
    StorageService.saveItinerary(updatedEvents);
  }

  @Watch('lat')
  @Watch('lon')
  async onLocationChange() {
    if (this.lat && this.lon) await this.fetchSuggestions();
  }

  async fetchSuggestions() {
    try {
      this.loading = true;
      this.suggestions = await ApiService.getDestinationDetails(this.lat!, this.lon!);
    } catch (err) {
      console.error('Error fetching Geoapify places:', err);
      this.suggestions = [];
    } finally {
      this.loading = false;
    }
  }

  // 🔹 Add a suggested or custom event
  handleAddEvent(
    name: string,
    cost: number = 0,
    address?: string,
    image?: string
  ) {
    if (!name.trim()) return;

    const newItem: ItineraryEvent = {
      name,
      completed: false,
      cost,
      address,
      image,
    };

    // ✅ 1️⃣ Add to local itinerary list
    const updatedEvents = [...this.events, newItem];
    this.events = updatedEvents;
    StorageService.saveItinerary(updatedEvents);

    // ✅ 2️⃣ Remove from suggestions (avoid showing it again)
    this.suggestions = this.suggestions.filter((s) => s.name !== name);

    // ✅ 3️⃣ Update Budget Tracker
    const currentBudget = StorageService.loadBudget();
    const updatedBudget = [...currentBudget, { name, amount: cost }];
    StorageService.saveBudget(updatedBudget);
    window.dispatchEvent(new CustomEvent('budgetUpdated'));

    // ✅ 4️⃣ Clear inputs
    this.newEvent = '';
    this.newEventCost = 0;
  }


  handleRemoveEvent(index: number) {
    const eventToRemove = this.events[index];
    const updatedEvents = this.events.filter((_, i) => i !== index);
    this.events = updatedEvents;
    StorageService.saveItinerary(updatedEvents);

    // Remove from Budget Tracker too
    const currentBudget = StorageService.loadBudget().filter((b) => b.name !== eventToRemove.name);
    StorageService.saveBudget(currentBudget);
    window.dispatchEvent(new CustomEvent('budgetUpdated'));
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
        <h2 class="section-title">Smart Itinerary Planner</h2>

        {/* ➕ Add custom user activity */}
        <div class="input-group">
          <input
            type="text"
            value={this.newEvent}
            placeholder="Add your own custom activity..."
            onInput={(e) => (this.newEvent = (e.target as HTMLInputElement).value)}
            class="input-field"
          />
          <input
            type="number"
            value={this.newEventCost}
            placeholder="Cost (₹)"
            onInput={(e) =>
              (this.newEventCost = parseFloat((e.target as HTMLInputElement).value))
            }
            class="input-field cost-input"
          />
          <button
            class="add-btn"
            onClick={() => this.handleAddEvent(this.newEvent, this.newEventCost)}
          >Add</button>
        </div>

        {/* 🌍 Suggested famous places */}
        {this.loading ? (
          <p class="loading-text">Fetching nearby attractions...</p>
        ) : (
          this.suggestions.length > 0 && (
            <div class="suggestions">
              <h3>Top Recommended Places Nearby</h3>
              {this.suggestions.map((s) => (
                <div class="suggestion-card">
                  <img
                    src={
                      s.image ||
                      'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'
                    }
                    alt={s.name}
                    class="suggestion-img"
                  />
                  <div class="suggestion-info">
                    <strong>{s.name}</strong>
                    <p class="place-type">{s.type}</p>
                    {s.address && <p class="address">{s.address}</p>}
                    <p class="cost">Avg. cost: ₹{s.cost}</p>
                  </div>

                  <button
                    class="add-btn"
                    onClick={() =>
                      this.handleAddEvent(
                        s.name,
                        s.cost,
                        s.address,
                        s.image
                      )
                    }
                  >Add</button>
                </div>
              ))}
            </div>
          )
        )}

        {/* 📋 User itinerary timeline */}
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
                {event.address && <p class="event-address">📍 {event.address}</p>}
                {event.cost !== undefined && (
                  <span class="event-cost">₹{event.cost}</span>
                )}
                <button
                  class="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleRemoveEvent(index);
                  }}
                >❌</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
