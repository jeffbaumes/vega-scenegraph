import boundStroke from '../bound/boundStroke';
import context from '../bound/boundContext';
import pathParse from '../path/parse';
import pathRender from '../path/render';
import geometryForPath from '../path/geometryForPath';
import {drawAll} from '../util/canvas/draw';
import {pickPath} from '../util/canvas/pick';
import translateItem from '../util/svg/translateItem';
import {visit} from '../util/visit';
import fillGL from '../util/webgl/fill';
import strokeGL from '../util/webgl/stroke';
import pixelsToDisplay from '../util/webgl/pixelsToDisplay';

function attr(emit, item) {
  emit('transform', translateItem(item));
  emit('d', item.path);
}

function path(context, item) {
  var path = item.path;
  if (path == null) return true;

  var cache = item.pathCache;
  if (!cache || cache.path !== path) {
    (item.pathCache = cache = pathParse(path)).path = path;
  }
  pathRender(context, cache, item.x, item.y);
}

function drawGL(context, scene, bounds) {
  visit(scene, function(item) {
    var opacity = item.opacity == null ? 1 : item.opacity;
    if (opacity === 0) return;

    var path = item.path;
    if (path == null) return true;

    var geom = geometryForPath(path);

    var x = item.x || 0,
        y = item.y || 0;

    context._tx += x;
    context._ty += y;

    if (item.fill && fillGL(context, item, opacity, geom.triangles.cells.length)) {
      geom.triangles.cells.forEach(function (cell) {
        var p1 = pixelsToDisplay(context, geom.triangles.positions[cell[0]]);
        var p2 = pixelsToDisplay(context, geom.triangles.positions[cell[1]]);
        var p3 = pixelsToDisplay(context, geom.triangles.positions[cell[2]]);
        context._triangleGeometry.push(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
      });
    }

    if (item.stroke) {
      strokeGL(context, item, opacity, geom.lines, geom.closed);
    }

    context._tx -= x;
    context._ty -= y;
  });
}

function bound(bounds, item) {
  return path(context(bounds), item)
    ? bounds.set(0, 0, 0, 0)
    : boundStroke(bounds, item);
}

export default {
  type:   'path',
  tag:    'path',
  nested: false,
  attr:   attr,
  bound:  bound,
  draw:   drawAll(path),
  drawGL: drawGL,
  pick:   pickPath(path)
};
