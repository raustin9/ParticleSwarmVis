// FROM: https://www.youtube.com/watch?v=789weryntzM&ab_channel=ChrisCourses

/**
 * @title distance(x1, y1, x2, y2)
 * @description Calculates Pythagorean theorem to find distance between objects
 *
 * @param {number} x1 X Coordinate of first object
 * @param {number} y1 Y Coordinate of first object
 * @param {number} x2 X Coordinate of second object
 * @param {number} y2 Y Coordinate of second object
 * @returns {number} Distance
 */
export function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

/**
 * @title randomIntFromRange(min, max)
 * @description Gets random number between the min and max values
 *
 * @param {number} min Minimum value for random number range
 * @param {number} max Maximum value for random number range
 * @returns {number} Random number
 */
export function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * @title rotateVelocities(velocity, theta)
 * @description Calculates the velocity after object collision
 *
 * @param {Object} velocity Speed parameter with direction
 * @param {number} theta The negative tangent between two objects' masses
 * @returns {Object} Resulting velocity
 */
export function rotateVelocities(velocity, theta) {
    const rotatedVelocity = {
        x: velocity.x * Math.cos(theta) - velocity.y * Math.sin(theta),
        y: velocity.x * Math.sin(theta) + velocity.y * Math.cos(theta),
    };
    return rotatedVelocity;
}
