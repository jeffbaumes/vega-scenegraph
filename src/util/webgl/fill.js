import color from './color';

export default function(context, item, opacity, count) {
  var i, c, tc = context._triangleColor;
  opacity *= (item.fillOpacity==null ? 1 : item.fillOpacity);
  // TODO: don't special-case 'transparent'
  if (opacity > 0 && item.fill !== 'transparent') {
    c = color(context, item, item.fill);
    for (i = 0; i < count * 3; i++) {
      tc.push(c[0], c[1], c[2], opacity);
    }
    return true;
  } else {
    return false;
  }
}
