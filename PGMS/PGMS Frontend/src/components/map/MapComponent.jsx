import React, { useState } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi'

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
}

// Default center (Mumbai, India)
const defaultCenter = {
  lat: 19.0760,
  lng: 72.8777
}

// Google Maps API Key from environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCGFmUAXwjb0-jS4Mk6I_QhEbIMtM--CeU'

// Custom map styles for a modern look
const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
]

export default function MapComponent({ locations, searchQuery, searchCenter }) {
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Filter locations based on search query (if any)
  const filteredLocations = locations.filter((location) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      location.name?.toLowerCase().includes(query) ||
      location.hostelAddress?.toLowerCase().includes(query)
    )
  })

  // Get center position - use searchCenter if provided, otherwise calculate from locations
  const getCenter = () => {
    // If searchCenter is provided (from geocoding), use it
    if (searchCenter) {
      return { lat: searchCenter.lat, lng: searchCenter.lng }
    }
    
    // Otherwise, use default or calculate from locations
    if (filteredLocations.length === 0) return defaultCenter
    
    const locationsWithCoords = filteredLocations.filter(
      loc => loc.latitude && loc.longitude
    )
    
    if (locationsWithCoords.length === 0) return defaultCenter
    
    // Calculate average position
    const avgLat = locationsWithCoords.reduce((sum, loc) => sum + loc.latitude, 0) / locationsWithCoords.length
    const avgLng = locationsWithCoords.reduce((sum, loc) => sum + loc.longitude, 0) / locationsWithCoords.length
    
    return { lat: avgLat, lng: avgLng }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ marginTop: '2rem' }}
    >
      <div style={{
        height: '500px',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={getCenter()}
            zoom={12}
            options={{
              styles: mapStyles,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {/* Markers for each location */}
            {filteredLocations.map((location) => {
              // Only show markers for locations with coordinates
              if (!location.latitude || !location.longitude) return null

              return (
                <Marker
                  key={location.id}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  onClick={() => setSelectedLocation(location)}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  }}
                />
              )
            })}

            {/* Info Window for selected location */}
            {selectedLocation && (
              <InfoWindow
                position={{
                  lat: selectedLocation.latitude,
                  lng: selectedLocation.longitude
                }}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div style={{
                  padding: '0.5rem',
                  minWidth: '200px',
                }}>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#111827',
                  }}>
                    {selectedLocation.hostelName || selectedLocation.name}
                  </h3>
                  {selectedLocation.hostelName && (
                    <p style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.875rem',
                      color: '#9ca3af',
                      fontStyle: 'italic',
                    }}>
                      Owner: {selectedLocation.name}
                    </p>
                  )}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}>
                    <FiMapPin style={{ marginTop: '0.25rem', color: '#6b7280', flexShrink: 0 }} />
                    <p style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: '1.4',
                    }}>
                      {selectedLocation.hostelAddress}
                    </p>
                  </div>
                  {selectedLocation.phone && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem',
                    }}>
                      <FiPhone style={{ color: '#6b7280' }} />
                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#6b7280',
                      }}>
                        {selectedLocation.phone}
                      </p>
                    </div>
                  )}
                  {selectedLocation.email && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <FiMail style={{ color: '#6b7280' }} />
                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#6b7280',
                      }}>
                        {selectedLocation.email}
                      </p>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {filteredLocations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#fef3c7',
            borderRadius: '0.5rem',
            textAlign: 'center',
            color: '#92400e',
          }}
        >
          <p style={{ margin: 0 }}>No PG/Hostels found matching your search.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
