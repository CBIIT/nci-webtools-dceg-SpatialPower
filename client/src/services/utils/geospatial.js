/** Tau simplifies certain calculations compared to pi */
export const TAU = Math.PI * 2;

/**
 * Converts degrees to radians
 * @param {number} degrees 
 */
export function radians(degrees) {
    return degrees * TAU / 360;
}

/**
 * Converts radians to degrees
 * @param {number} radians 
 */
export function degrees(radians) {
    return radians * 360 / TAU;
}

/**
 * Ensures longitude properly wraps between -180 and 180
 * @param {number} longitude 
 */
export function normalizeLongitude(longitude) {
    return (longitude >= -180 && longitude <= 180)
        ? longitude
        : (longitude + 540) % 360 - 180;
}

/**
 * Ensures latitude properly wraps between -90 and 90
 * @param {number} latitude 
 */
export function normalizeLatitude(latitude) {
    return (latitude >= -90 && latitude <= 90)
        ? latitude
        : Math.abs((latitude % 360 + 270) % 360 - 180) - 90;
}

/**
 * Normalizes a set of coordinates
 * @param {[longitude: number, latitude: number]} coordinates
 */
export function normalizeCoordinates([longitude, latitude]) {
    return [normalizeLongitude(longitude), normalizeLatitude(latitude)];
}

/**
 * Calculates the spherical distance between two coordinates using the Haversine formula
 * @param {[longitude: number, latitude: number]} source - source coordinates
 * @param {[longitude: number, latitude: number]} target - target coordinates
 */
export function sphericalDistance(source, target, globalRadius = 6371e3) {
    const [sourceLongitude, sourceLatitude] = normalizeCoordinates(source).map(radians);
    const [targetLongitude, targetLatitude] = normalizeCoordinates(target).map(radians);
    return 2 * globalRadius * Math.asin(Math.sqrt(
        Math.pow(Math.sin((targetLatitude - sourceLatitude) / 2), 2) +
        Math.cos(sourceLatitude) * Math.cos(targetLatitude) *
        Math.pow(Math.sin((targetLongitude - sourceLongitude) / 2), 2)
    ));
}

/**
  * Determines target coordinates from source coordinates, target bearing and distance
  * @param {number} longitude - source longitude
  * @param {number} latitude - source latitude
  * @param {number} bearingDegrees - target bearing
  * @param {number} distance - distance (in meters)
  * @param {number} globalRadius - radius of global spheroid (in meters)
  */
export function getTargetCoordinates(longitude, latitude, bearingDegrees, distance, globalRadius = 6371e3) {
    [longitude, latitude] = normalizeCoordinates([longitude, latitude]).map(radians);
    const bearing = radians(bearingDegrees);
    const angularDistance = distance / globalRadius;

    const targetLatitude = degrees(Math.asin(
        Math.sin(latitude) * Math.cos(angularDistance) +
        Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing)
    ));

    const targetLongitude = degrees(longitude + Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude),
        Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(targetLatitude)
    ));

    return [targetLongitude, targetLatitude];
}

/**
 * Determines rectangular coordinates
 * @param {number} longitude - longitude of upper-left corner
 * @param {number} latitude - latitude of upper-left corner
 * @param {number} horizontalDistance - width (in meters)
 * @param {number} verticalDistance - height (in meters)
 * @param {number} globalRadius - radius of global spheroid (in meters)
 * @returns {[longitude: number, latitude: number][]} An array of valid GeoJSON coordinates
 */
export function getRectangularCoordinates(longitude, latitude, horizontalDistance, verticalDistance, globalRadius = 6371e3) {
    const topLeft = normalizeCoordinates([longitude, latitude]);
    const bottomLeft = getTargetCoordinates(longitude, latitude, 180, verticalDistance, globalRadius)
    const topRight = getTargetCoordinates(longitude, latitude, 90, horizontalDistance, globalRadius);
    const bottomRight = getTargetCoordinates(topRight[0], topRight[1], 180, verticalDistance)
    return [topLeft, topRight, bottomRight, bottomLeft, topLeft]; // clockwise
}

/**
 * Determines regular polygonal coordinates, useful in approximating circles
 * @param {number} longitude - longitude of center
 * @param {number} latitude - latitude of center
 * @param {number} radius - radius of polygon
 * @param {number} numSides - number of sides
 * @param {number} globalRadius - radius of global spheroid (in meters)
 * @returns {[longitude: number, latitude: number][]} An array of valid GeoJSON coordinates
 */
export function getRegularPolygonalCoordinates(longitude, latitude, radius, numSides = 128, globalRadius = 6371e3) {
    let coordinates = new Array(numSides + 1);
    for (let i = 0; i < numSides; i++) {
        const bearing = i * (360 / numSides);
        coordinates[i] = getTargetCoordinates(longitude, latitude, bearing, radius, globalRadius);
    }
    coordinates[numSides] = coordinates[0]; // close polygon
    return coordinates;
}

