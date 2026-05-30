// Only initialize the map if the current page contains a map container
if (document.getElementById('map')) {
    const map = L.map('map').setView([51.5, 10], 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Layer groups for different elements
    const routeLayer = L.layerGroup().addTo(map);
    const waypointsLayer = L.layerGroup().addTo(map);
    const userLocationLayer = L.layerGroup().addTo(map);

    let userLocation = null;

    // Geolocation - Get current user location
    function initializeGeolocation() {
        const statusEl = document.getElementById('location-status');
        
        if (!statusEl) return;

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    updateUserLocation();
                    statusEl.textContent = `📍 Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                },
                (error) => {
                    statusEl.textContent = '❌ Location access denied or unavailable';
                    console.warn('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            statusEl.textContent = '❌ Geolocation not supported';
        }
    }

    function updateUserLocation() {
        if (!userLocation) return;
        
        userLocationLayer.clearLayers();
        
        // Add marker for user location
        L.circleMarker([userLocation.lat, userLocation.lng], {
            radius: 8,
            fillColor: '#4CAF50',
            color: '#2196F3',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(userLocationLayer)
          .bindPopup('Your Location');
        
        // Add accuracy circle if available
        navigator.geolocation.getCurrentPosition((position) => {
            const accuracy = position.coords.accuracy;
            L.circle([userLocation.lat, userLocation.lng], {
                radius: accuracy,
                fillColor: '#4CAF50',
                color: '#4CAF50',
                weight: 1,
                opacity: 0.2,
                fillOpacity: 0.1
            }).addTo(userLocationLayer);
        });
    }

    // Extract track points from GPX
    function extractTrackPoints(gpxDOM) {
        const points = [];
        const trkpts = gpxDOM.getElementsByTagName('trkpt');
        
        for (let i = 0; i < trkpts.length; i++) {
            const lat = parseFloat(trkpts[i].getAttribute('lat'));
            const lon = parseFloat(trkpts[i].getAttribute('lon'));
            
            if (!isNaN(lat) && !isNaN(lon)) {
                points.push([lat, lon]);
            }
        }
        
        return points;
    }

    function getPhotoUrlFromWaypointFile(file) {
        const fileName = file.replace(/\.gpx$/i, '');
        return `photos/${fileName}.jpeg`;
    }

    // Extract waypoints from GPX
    function extractWaypoints(gpxDOM, sourceFile) {
        const waypoints = [];
        const wpts = gpxDOM.getElementsByTagName('wpt');
        
        for (let i = 0; i < wpts.length; i++) {
            const lat = parseFloat(wpts[i].getAttribute('lat'));
            const lon = parseFloat(wpts[i].getAttribute('lon'));
            const nameEl = wpts[i].getElementsByTagName('name')[0];
            const name = nameEl ? nameEl.textContent : `Waypoint ${i + 1}`;
            
            if (!isNaN(lat) && !isNaN(lon)) {
                waypoints.push({
                    lat,
                    lon,
                    name,
                    photo: getPhotoUrlFromWaypointFile(sourceFile)
                });
            }
        }
        
        return waypoints;
    }

    // Draw route on map
    function drawRoute(points) {
        if (points.length === 0) {
            alert('No track points found in GPX file');
            return;
        }
        
        routeLayer.clearLayers();
        
        // Draw line
        L.polyline(points, {
            color: '#2196F3',
            weight: 3,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(routeLayer);
        
        // Fit map to route
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Draw waypoints on map
    function drawWaypoints(waypoints) {
        waypointsLayer.clearLayers();
        
        waypoints.forEach((wp) => {
            const popupHtml = `
                <div style="text-align:center; max-width:280px;">
                    <img src="${wp.photo}" alt="${wp.name}" style="width:100%; height:auto; border-radius:8px; display:block; margin:0 auto;" loading="lazy" />
                </div>
            `;

            L.marker([wp.lat, wp.lon], {
                icon: L.icon({
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjRkY5ODAwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(waypointsLayer)
              .bindPopup(popupHtml, { maxWidth: 280 });
        });
    }

    // Load GPX content from URL
    function loadGPXFromURL(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                return response.text();
            })
            .then(gpxContent => {
                const parser = new DOMParser();
                const gpxDOM = parser.parseFromString(gpxContent, 'text/xml');
                
                if (gpxDOM.getElementsByTagName('parsererror').length) {
                    throw new Error('Invalid GPX file');
                }
                
                return gpxDOM;
            });
    }

    async function loadRouteFile(gpxUrl) {
        try {
            const routeGPX = await loadGPXFromURL(gpxUrl);
            const points = extractTrackPoints(routeGPX);
            drawRoute(points);
        } catch (error) {
            console.error(`Error loading route: ${error.message}`);
        }
    }

    async function loadWaypointFiles(gpxFiles) {
        const allWaypoints = [];

        for (const file of gpxFiles) {
            try {
                const gpxDOM = await loadGPXFromURL(file);
                const waypoints = extractWaypoints(gpxDOM, file);
                allWaypoints.push(...waypoints);
            } catch (error) {
                console.warn(`Warning: Could not load ${file}: ${error.message}`);
            }
        }

        if (allWaypoints.length > 0) {
            drawWaypoints(allWaypoints);
        }
    }

    const routeGPXUrl = document.body.dataset.gpx;
    const waypointFiles = document.body.dataset.waypoints
        ? document.body.dataset.waypoints.split(',').map(file => file.trim()).filter(Boolean)
        : [
            'baillamont-birdhouse-1.gpx',
            'baillamont-birdhouse-2.gpx',
            'baillamont-birdhouse-3.gpx'
        ];
    const centerLocationBtn = document.getElementById('center-location-btn');

    if (routeGPXUrl) {
        initializeGeolocation();
        loadRouteFile(routeGPXUrl);
        loadWaypointFiles(waypointFiles);
    }

    if (centerLocationBtn) {
        centerLocationBtn.addEventListener('click', () => {
            if (userLocation) {
                map.setView([userLocation.lat, userLocation.lng], 15);
            } else {
                alert('Location not available yet');
            }
        });
    }
}
