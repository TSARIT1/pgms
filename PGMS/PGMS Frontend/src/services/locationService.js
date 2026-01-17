import { apiGet } from './apiHelper'

const LOCATIONS_BASE_URL = '/locations'

export const getAllHostelLocations = async () => {
    return await apiGet(`${LOCATIONS_BASE_URL}/hostels`)
}
