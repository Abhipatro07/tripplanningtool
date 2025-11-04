import { Component, Prop, Watch, h, Element } from '@stencil/core';

@Component({
  tag: 'map-view',
  styleUrl: 'map-viewer.css',
  shadow: false,
})
export class MapViewer {
  @Element() element: HTMLElement;
  private mapContainer!: HTMLElement;
  private map!: google.maps.Map;
  private marker?: google.maps.Marker;

  //! Incoming coordinates from parent (app-root passes these)
  @Prop() lat: number | null = null;
  @Prop() lon: number | null = null;

  private GOOGLE_MAPS_API_KEY = 'AIzaSyAsR7aoJssy8pm8-oOdRnWZYhDPMWXyPSs';

  async componentDidLoad() {
    //! find the container inside the (non-shadow) element
    this.mapContainer = this.element.querySelector('.map-container') as HTMLElement;

    if (!this.mapContainer) {
      console.error('Map container not found');
      return;
    }

    //! load google maps script
    await this.loadGoogleMapsScript(this.GOOGLE_MAPS_API_KEY);

    this.map = new google.maps.Map(this.mapContainer, {
      center: { lat: this.lat ?? 20.5937, lng: this.lon ?? 78.9629 },
      zoom: this.lat && this.lon ? 10 : 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: true,
    });

    //! If we already have coords, add marker
    if (this.lat != null && this.lon != null) {
      this.addOrMoveMarker(this.lat, this.lon);
    }

    window.addEventListener('resize', () => google.maps.event.trigger(this.map, 'resize'));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        google.maps.event.trigger(this.map, 'resize');
      }
    });
  }

  //! If parent updates lat/lon, recenter and add marker
  @Watch('lat')
  @Watch('lon')
  async onLocationChanged() {
    if (!this.map) return;
    if (this.lat == null || this.lon == null) return;

    const pos = { lat: this.lat, lng: this.lon };
    this.map.panTo(pos);
    this.map.setZoom(10);
    this.addOrMoveMarker(this.lat, this.lon);
  }

  private addOrMoveMarker(lat: number, lon: number) {
    const pos = new google.maps.LatLng(lat, lon);
    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: pos,
        map: this.map,
      });
    } else {
      this.marker.setPosition(pos);
    }

    const infow = new google.maps.InfoWindow({ content: `<b>${lat.toFixed(4)}, ${lon.toFixed(4)}</b>` });
    infow.open(this.map, this.marker);
  }

  //! Dynamic loader for Google Maps JS
  private loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.maps) {
        resolve();
        return;
      }

      const existing = document.querySelector(`script[data-gmaps="true"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject());
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-gmaps', 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  }

  render() {
    return (
      <div class="map-viewer">
        <h2 class="section-title">Map Viewer (Google Maps)</h2>
        <div class="map-container" />
      </div>
    );
  }
}
