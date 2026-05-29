# Merelroute - GPX Route Viewer

A simple, mobile-friendly web application to view GPX routes and waypoints on an OpenStreetMap.

## Features

- 📍 **Current Location**: Displays your current location (with user permission)
- 🗺️ **OpenStreetMap Integration**: View routes and waypoints on interactive map
- 📄 **Fixed GPX Files**: Pre-configured route and waypoint files (no user upload needed)
- 📱 **Mobile Responsive**: Optimized for phones, tablets, and desktops
- 🎯 **Waypoint Markers**: Visual markers for waypoints with names
- 🛣️ **Route Visualization**: Draw GPX tracks on the map

## Usage

### Basic Setup

1. Open `index.html` in a modern web browser
2. Allow geolocation access when prompted
3. Route and waypoints load automatically

### Navigation

- **Center on Location**: Click the green button to center the map on your current location
- **Zoom & Pan**: Use standard map controls to navigate
- **Waypoint Info**: Click on any waypoint marker to see its name

### Customizing GPX Files

The route and waypoints are loaded from fixed GPX files:
- **Route**: `baillamont-route-1.gpx` (contains track points)
- **Waypoints**: `baillamont-birdhouse-1.gpx`, `baillamont-birdhouse-2.gpx`, `baillamont-birdhouse-3.gpx` (one file per waypoint)

To change the route or waypoints, replace the contents of these files with your own GPX data. The app will automatically load the updated files when you refresh the page.

## GPX File Format

### Route File Example
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <trk>
    <name>Route Name</name>
    <trkseg>
      <trkpt lat="51.5074" lon="-0.1278">
        <ele>11</ele>
      </trkpt>
      <!-- More track points -->
    </trkseg>
  </trk>
</gpx>
```

### Waypoint File Example
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <wpt lat="51.5074" lon="-0.1278">
    <name>Waypoint Name</name>
  </wpt>
  <!-- More waypoints -->
</gpx>
```

## Sample Files

The application includes pre-configured GPX files:
- `baillamont-route-1.gpx` - Example route track
- `baillamont-birdhouse-1.gpx` - First waypoint (Start Point)
- `baillamont-birdhouse-2.gpx` - Second waypoint (Midpoint)
- `baillamont-birdhouse-3.gpx` - Third waypoint (End Point)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Geolocation works best on HTTPS or localhost

## Files

- `index.html` - Main HTML structure
- `style.css` - Mobile-responsive styling
- `app.js` - Map functionality and automatic GPX loading
- `baillamont-route-1.gpx` - Fixed route file
- `baillamont-birdhouse-1.gpx` - Fixed waypoint file 1
- `baillamont-birdhouse-2.gpx` - Fixed waypoint file 2
- `baillamont-birdhouse-3.gpx` - Fixed waypoint file 3

## Dependencies

- **Leaflet.js** - Interactive map library (loaded from CDN)
- **OpenStreetMap** - Map tiles (via CDN)

## Notes

- This app works completely client-side - no server required
- GPX files are automatically loaded from fixed files (no user upload)
- GPX files are parsed locally in your browser
- Your location data is never sent to any server
- Works offline once the page is loaded (except for map tiles which require internet)
- To change the route or waypoints, replace the GPX file contents and refresh the page

## Future Enhancements

- Elevation profile visualization
- Multiple route management
- Route export functionality
- Distance/time statistics
- Offline map support

## Run a Local Web Server to run the site locally

- Using Python:
### Python 3
cd /Users/thomascougnon2/Projects/Merelroute
python3 -m http.server 8000

Then open http://localhost:8000 in the browser


# Application structure redesign (29/5/2026)

### What changed
- index.html
  - Rewritten as a landing page with:
    - header section containing an image and title
    - content section with article text
    - route selection card linking to baillamont-route-1.html
    - footer placeholder

- baillamont-route-1.html
  - Added a new dedicated route page
  - Includes a map container, back link, route title, and controls
  - Uses `data-gpx="baillamont-route-1.gpx"` to load the route

- app.js
  - Updated to initialize only when a map is present
  - Added support for loading a specific GPX file from `body.dataset.gpx`
  - Preserved geolocation and route rendering logic for the route page

- style.css
  - Added layout styles for header, content, footer, and route cards
  - Kept Leaflet map styling and mobile responsiveness

