    mapboxgl.accessToken = 'pk.eyJ1IjoiZGltYW5hMTMwMiIsImEiOiJjbWdwZHYzankxYmFhMmtzYXUybmpiNnI5In0.b_wKEHVxQCPZFsPbjinCBQ';

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12', 
      center: [25.4858, 42.7339], 
      
      zoom: 7,      
      minZoom: 6,    
      maxZoom: 15   
    });

    map.on('load', () => {
      map.addSource('my-data', {
        'type': 'vector',
        'url': 'mapbox://dimana1302.cmgpebaa80kcd1mqlv8qz4b98-8ca80'
      });

      map.addLayer({
        'id': 'my-layer',
        'type': 'circle',
        'source': 'my-data',
        'source-layer': 'DamMap', 
        'paint': {
          'circle-radius': 6,
          'circle-color': '#007cbf'
        }
      });
    });
const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  // Show popup on hover
  map.on('mouseenter', 'my-layer', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    const f = e.features[0];
    const p = f.properties;

    // Build popup content using your fields
    const html = `
      <div style="max-width:220px; font-family:sans-serif;">
        <strong>${p.city || 'Неизвестен град'}</strong><br>
        <em>${p.location || ''}</em><br>
        Район: ${p.rayon || ''}<br>
        Име: ${p.person || ''}
      </div>
    `;
    popup.setLngLat(f.geometry.coordinates).setHTML(html).addTo(map);
  });
  // Remove popup when mouse leaves
  map.on('mouseleave', 'my-layer', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  // On click — open link (if available)
  map.on('click', 'my-layer', (e) => {
    const feature = e.features[0];
    const url = feature.properties.url;

    if (url) {
      window.open(url, '_blank'); // open in new tab
    }
  });

