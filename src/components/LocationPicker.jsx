import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Search, MapPin, Loader2, X, Navigation } from 'lucide-react';

const LIBRARIES = ['places'];
const MAP_CENTER_DEFAULT = { lat: 20.5937, lng: 78.9629 }; // India
const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];
const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: MAP_STYLES,
};

// Extract structured address components from a Google geocode result
function parseGeocoderResult(result) {
  const get = (type) =>
    result.address_components?.find(c => c.types.includes(type));

  const streetNumber = get('street_number')?.long_name || '';
  const route        = get('route')?.long_name || '';
  const sublocality  = get('sublocality_level_1')?.long_name || get('sublocality')?.long_name || '';
  const line1        = [streetNumber, route, sublocality].filter(Boolean).join(', ')
                       || result.formatted_address?.split(',')[0] || '';

  const city =
    get('locality')?.long_name ||
    get('administrative_area_level_2')?.long_name ||
    get('administrative_area_level_3')?.long_name || '';

  const state   = get('administrative_area_level_1')?.long_name || '';
  const pincode = get('postal_code')?.long_name || '';

  return { line1, city, state, pincode };
}

// Format an autocomplete prediction for display
function formatPrediction(p) {
  const main = p.structured_formatting?.main_text || p.description.split(',')[0];
  const sub  = p.structured_formatting?.secondary_text || '';
  return { main, sub };
}

export default function LocationPicker({ onSelect }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const [query, setQuery]               = useState('');
  const [predictions, setPredictions]   = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching]       = useState(false);
  const [mapCenter, setMapCenter]       = useState(MAP_CENTER_DEFAULT);
  const [markerPos, setMarkerPos]       = useState(null);
  const [locating, setLocating]         = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  const autocompleteService = useRef(null);
  const geocoderService     = useRef(null);
  const searchTimer         = useRef(null);
  const dropdownRef         = useRef(null);
  const inputRef            = useRef(null);
  const mapRef              = useRef(null);

  // Initialise Google services once the script is loaded
  useEffect(() => {
    if (!isLoaded) return;
    autocompleteService.current = new window.google.maps.places.AutocompleteService();
    geocoderService.current     = new window.google.maps.Geocoder();
  }, [isLoaded]);

  // Debounced Places autocomplete search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!isLoaded || !query || query.trim().length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }
    searchTimer.current = setTimeout(() => {
      if (!autocompleteService.current) return;
      setSearching(true);
      autocompleteService.current.getPlacePredictions(
        { input: query, componentRestrictions: { country: 'in' } },
        (results, status) => {
          setSearching(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setShowDropdown(true);
          } else {
            setPredictions([]);
            setShowDropdown(false);
          }
        }
      );
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [query, isLoaded]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current    && !inputRef.current.contains(e.target)
      ) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const applyGeocoderResult = useCallback((result) => {
    const { line1, city, state, pincode } = parseGeocoderResult(result);
    const lat   = result.geometry.location.lat();
    const lng   = result.geometry.location.lng();
    const label = result.formatted_address || '';
    const short = label.split(',').slice(0, 3).join(', ');

    setSelectedLabel(short);
    setQuery(short);
    setMarkerPos({ lat, lng });
    setMapCenter({ lat, lng });
    setShowDropdown(false);
    setPredictions([]);

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }

    onSelect?.({ address: line1, city, state, zip: pincode, lat, lng });
  }, [onSelect]);

  // When user picks a suggestion, geocode the place_id for full details
  const handlePredictionClick = useCallback((prediction) => {
    if (!geocoderService.current) return;
    setShowDropdown(false);
    setSearching(true);
    geocoderService.current.geocode(
      { placeId: prediction.place_id },
      (results, status) => {
        setSearching(false);
        if (status === 'OK' && results?.[0]) applyGeocoderResult(results[0]);
      }
    );
  }, [applyGeocoderResult]);

  // Reverse geocode when user clicks on the map
  const handleMapClick = useCallback((e) => {
    if (!geocoderService.current) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    setSearching(true);
    geocoderService.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        setSearching(false);
        if (status === 'OK' && results?.[0]) applyGeocoderResult(results[0]);
      }
    );
  }, [applyGeocoderResult]);

  // GPS geolocation → reverse geocode
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation || !geocoderService.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        geocoderService.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            setLocating(false);
            if (status === 'OK' && results?.[0]) applyGeocoderResult(results[0]);
          }
        );
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [applyGeocoderResult]);

  const clearSearch = () => {
    setQuery('');
    setPredictions([]);
    setShowDropdown(false);
    setSelectedLabel('');
    inputRef.current?.focus();
  };

  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  if (loadError) {
    return (
      <div className="col-span-2 p-4 border border-red-200 bg-red-50 rounded-sm text-[12px] text-red-600 font-medium">
        Failed to load Google Maps. Check your API key in <code>.env</code> (<code>VITE_GOOGLE_MAPS_API_KEY</code>).
      </div>
    );
  }

  return (
    <div className="col-span-2 space-y-4">

      {/* ── Smart Search Bar ── */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-3 w-full bg-surface border border-border-minimal rounded-sm px-4 py-3 focus-within:border-accent transition-colors">
          {searching
            ? <Loader2 className="w-4 h-4 text-subtle shrink-0 animate-spin" />
            : <Search className="w-4 h-4 text-subtle shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => predictions.length > 0 && setShowDropdown(true)}
            placeholder="Search area, street, city, landmark, pincode…"
            className="flex-1 bg-transparent outline-none text-[13px] font-medium text-ink placeholder:text-subtle/60"
            disabled={!isLoaded}
          />
          {query && (
            <button onClick={clearSearch} className="text-subtle hover:text-ink transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="w-px h-5 bg-border-minimal mx-1" />
          <button
            onClick={handleLocateMe}
            disabled={locating || !isLoaded}
            title="Use my current location"
            className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors disabled:opacity-50 shrink-0"
          >
            {locating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Navigation className="w-4 h-4" />
            }
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
              {locating ? 'Locating…' : 'Use Location'}
            </span>
          </button>
        </div>

        {/* Predictions dropdown */}
        {showDropdown && predictions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-9999 bg-white border border-border-minimal shadow-xl mt-1 max-h-72 overflow-y-auto">
            {predictions.map((p) => {
              const { main, sub } = formatPrediction(p);
              return (
                <button
                  key={p.place_id}
                  onMouseDown={() => handlePredictionClick(p)}
                  className="w-full flex items-start gap-4 px-5 py-4 hover:bg-surface text-left border-b border-border-minimal/50 last:border-0 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{main}</p>
                    {sub && <p className="text-[11px] text-subtle font-medium mt-0.5 truncate">{sub}</p>}
                  </div>
                </button>
              );
            })}
            {/* Google attribution required */}
            <div className="px-5 py-2 flex justify-end">
              <img
                src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png"
                alt="Powered by Google"
                className="h-4 opacity-70"
              />
            </div>
          </div>
        )}
      </div>

      {/* Selected location pill */}
      {selectedLabel && (
        <div className="flex items-center gap-2 text-[11px] text-accent font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{selectedLabel}</span>
        </div>
      )}

      {/* ── Google Map ── */}
      <div className="w-full rounded-sm overflow-hidden border border-border-minimal" style={{ height: 300 }}>
        {!isLoaded ? (
          <div className="flex items-center justify-center h-full bg-surface">
            <Loader2 className="w-6 h-6 animate-spin text-subtle" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={markerPos ? 16 : 5}
            options={MAP_OPTIONS}
            onClick={handleMapClick}
            onLoad={onMapLoad}
          >
            {markerPos && <Marker position={markerPos} />}
          </GoogleMap>
        )}
      </div>

      <p className="text-[11px] text-subtle font-medium">
        Search by area, street or landmark — or click the map to pin your delivery location. Fields below will auto-fill.
      </p>
    </div>
  );
}
