
export default function(context, pt) {
  return [
    pt[0] + context._tx + context._origin[0],
    pt[1] + context._ty + context._origin[1]
  ];
}
