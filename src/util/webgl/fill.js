import color from './color';

export default function(context, item, opacity, count) {
  var i, c;
  opacity *= (item.fillOpacity==null ? 1 : item.fillOpacity);
  // TODO: don't special-case 'transparent'
  if (opacity > 0 && item.fill !== 'transparent') {
    for (i = 0; i < count * 3; i++) {
      c = color(context, item, item.fill);
      context._triangleColor.push(c[0], c[1], c[2], opacity);
    }
    return true;
  } else {
    return false;
  }
}
