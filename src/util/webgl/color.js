import {color} from 'd3-color';

export default function(context, item, value) {
  if (value.id) {
    // TODO: support gradients
    return [1.0, 1.0, 1.0];
  }
  var rgb = color(value).rgb();
  return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
}
