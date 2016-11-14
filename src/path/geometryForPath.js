import parse from 'parse-svg-path';
import simplify from 'simplify-path';
import contours from 'svg-path-contours';
import triangulate from 'triangulate-contours';

export default function(path, threshold) {
  threshold = threshold || 1.0;
  if (!path) {
    return {lines: [], triangles: {positions: [], cells: []}, closed: false};
  }
  // get a list of polylines/contours from svg contents
  var lines = contours(parse(path)), tri;

  // simplify the contours before triangulation
  lines = lines.map(function(path) {
    return simplify(path, threshold);
  });

  // triangluate can fail in some corner cases
  try {
    tri = triangulate(lines);
  }
  catch(e) {
    console.log('Could not triangulate the following path:');
    console.log(path);
    console.log(e);
    tri = {positions: [], cells: []}
  }

  return {lines: lines, triangles: tri, closed: path.endsWith('Z')};
}
