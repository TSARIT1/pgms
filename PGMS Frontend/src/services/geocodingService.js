// Geocoding service using Google Maps Geocoding API

// Google Maps API Key from environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCGFmUAXwjb0-jS4Mk6I_QhEbIMtM--CeU'

/**
 * Geocode an address/location to get coordinates using Google Maps Geocoding API
 * @param {string} address - The address or location to geocode
 * @returns {Promise<{lat: number, lng: number, displayName: string} | null>}
 */
export const geocodeAddress = async (address) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        )

        const data = await response.json()

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0]
            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                displayName: result.formatted_address
            }
        }

        if (data.status === 'ZERO_RESULTS') {
            console.warn('No results found for address:', address)
        } else if (data.status !== 'OK') {
            console.error('Geocoding error:', data.status, data.error_message)
        }

        return null
    } catch (error) {
        console.error('Geocoding error:', error)
        return null
    }
}

/**
 * Reverse geocode coordinates to get address using Google Maps Geocoding API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string | null>}
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
        )

        const data = await response.json()

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            return data.results[0].formatted_address
        }

        return null
    } catch (error) {
        console.error('Reverse geocoding error:', error)
        return null
    }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
}

const toRad = (value) => {
    return (value * Math.PI) / 180
}
