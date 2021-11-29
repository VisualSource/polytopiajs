import type { Position } from '../game/core/types';
/**
 * @description Chebyshev distance (or Tchebychev distance), maximum metric, or L∞ metric is a metric defined on a vector space where the distance between two vectors is the greatest of their differences along any coordinate dimension. It is named after Pafnuty Chebyshev. 
 * @summary D = max(|x2 - x1|, |y2 - y1|)
 * @see https://en.wikipedia.org/wiki/Chebyshev_distance
 * @export
 * @param {number[]} a
 * @param {number[]} b
 * @return {*} 
 */
export function chebyshev_distance(a: Position, b: Position) {
    return Math.max(Math.abs(b.row - a.row),Math.abs(b.col - a.col));
}


/*
const valb = distance({row: 0, col: 0},{row: 0, col: 2});

const withRoad = valb * 0.5 ;
withRoad
*/