
export default function(context, pt) {
  var w = context.canvas.width / context._ratio,
      h = context.canvas.height / context._ratio,
      x = pt[0] + context._tx + context._origin[0],
      y = pt[1] + context._ty + context._origin[1];
  return [(2 * x - w) / w, -(2 * y - h) / h];
}
