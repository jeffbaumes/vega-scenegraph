import {rectangle} from '../path/shapes';
import boundStroke from '../bound/boundStroke';
import {visit, pickVisit} from '../util/visit';
import stroke from '../util/canvas/stroke';
import fill from '../util/canvas/fill';
import translateItem from '../util/svg/translateItem';
import fillGL from '../util/webgl/fill';
import strokeGL from '../util/webgl/stroke';
import pixelsToDisplay from '../util/webgl/pixelsToDisplay';

function attr(emit, item, renderer) {
  var id = null, defs, c;

  emit('transform', translateItem(item));

  if (item.clip) {
    defs = renderer._defs;
    id = item.clip_id || (item.clip_id = 'clip' + defs.clip_id++);
    c = defs.clipping[id] || (defs.clipping[id] = {id: id});
    c.width = item.width || 0;
    c.height = item.height || 0;
  }

  emit('clip-path', id ? ('url(#' + id + ')') : null);
}

function background(emit, item) {
  var offset = item.stroke ? 0.5 : 0;
  emit('class', 'background');
  emit('d', rectangle(null, item, offset, offset));
}

function bound(bounds, group) {
  if (!group.clip && group.items) {
    var items = group.items;
    for (var j=0, m=items.length; j<m; ++j) {
      bounds.union(items[j].bounds);
    }
  }

  if (group.clip || group.width || group.height) {
    boundStroke(
      bounds.add(0, 0).add(group.width || 0, group.height || 0),
      group
    );
  }

  return bounds.translate(group.x || 0, group.y || 0);
}

function draw(context, scene, bounds) {
  var renderer = this;

  visit(scene, function(group) {
    var gx = group.x || 0,
        gy = group.y || 0,
        w = group.width || 0,
        h = group.height || 0,
        offset, opacity;

    // setup graphics context
    context.save();
    context.translate(gx, gy);

    // draw group background
    if (group.stroke || group.fill) {
      opacity = group.opacity == null ? 1 : group.opacity;
      if (opacity > 0) {
        context.beginPath();
        offset = group.stroke ? 0.5 : 0;
        rectangle(context, group, offset, offset);
        if (group.fill && fill(context, group, opacity)) {
          context.fill();
        }
        if (group.stroke && stroke(context, group, opacity)) {
          context.stroke();
        }
      }
    }

    // set clip and bounds
    if (group.clip) {
      context.beginPath();
      context.rect(0, 0, w, h);
      context.clip();
    }
    if (bounds) bounds.translate(-gx, -gy);

    // draw group contents
    visit(group, function(item) {
      renderer.draw(context, item, bounds);
    });

    // restore graphics context
    if (bounds) bounds.translate(gx, gy);
    context.restore();
  });
}

function pick(context, scene, x, y, gx, gy) {
  if (scene.bounds && !scene.bounds.contains(gx, gy) || !scene.items) {
    return null;
  }

  var handler = this;

  return pickVisit(scene, function(group) {
    var hit, dx, dy, b;

    // first hit test against bounding box
    // if a group is clipped, that should be handled by the bounds check.
    b = group.bounds;
    if (b && !b.contains(gx, gy)) return;

    // passed bounds check, so test sub-groups
    dx = (group.x || 0);
    dy = (group.y || 0);

    context.save();
    context.translate(dx, dy);

    dx = gx - dx;
    dy = gy - dy;

    hit = pickVisit(group, function(mark) {
      return (mark.interactive !== false || mark.marktype === 'group')
        ? handler.pick(mark, x, y, dx, dy)
        : null;
    });

    context.restore();
    if (hit) return hit;

    hit = scene.interactive !== false
      && (group.fill || group.stroke)
      && dx >= 0
      && dx <= group.width
      && dy >= 0
      && dy <= group.height;

    return hit ? group : null;
  });
}

function drawGL(context, scene, bounds) {
  var renderer = this;

  visit(scene, function(group) {
    var gx = group.x || 0,
        gy = group.y || 0,
        w = group.width || 0,
        h = group.height || 0,
        offset, opacity;

    // setup graphics context
    context._tx += gx;
    context._ty += gy;

    // draw group background
    if (group.stroke || group.fill) {
      opacity = group.opacity == null ? 1 : group.opacity;
      if (opacity > 0) {

        offset = group.stroke ? 0.5 : 0;
        var geom = rectangle(context, group, offset, offset);

        if (group.fill && fillGL(context, group, opacity, geom.triangles.cells.length)) {
          geom.triangles.cells.forEach(function (cell) {
            var p1 = pixelsToDisplay(context, geom.triangles.positions[cell[0]]);
            var p2 = pixelsToDisplay(context, geom.triangles.positions[cell[1]]);
            var p3 = pixelsToDisplay(context, geom.triangles.positions[cell[2]]);
            context._triangleGeometry.push(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
          });
        }

        if (group.stroke) {
          strokeGL(context, group, opacity, geom.lines, true);
        }
      }
    }

    // set clip and bounds
    if (group.clip) {
      // TODO: do something here in webgl?
    }
    if (bounds) bounds.translate(-gx, -gy);

    // draw group contents
    visit(group, function(item) {
      renderer.draw(context, item, bounds);
    });

    // restore graphics context
    if (bounds) bounds.translate(gx, gy);

    context._tx -= gx;
    context._ty -= gy;
  });
}

export default {
  type:       'group',
  tag:        'g',
  nested:     false,
  attr:       attr,
  bound:      bound,
  draw:       draw,
  pick:       pick,
  background: background,
  drawGL:     drawGL
};
