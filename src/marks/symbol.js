import {symbol} from '../path/shapes';
import markItemPath from './markItemPath';

var shapeMap = {
  undefined: 0,
  circle: 0,
  cross: 1,
  diamond: 2,
  square: 3,
  star: 4,
  triangle: 5,
  wye: 6
};

var fields = ['shape', 'size', 'stroke', 'fill', 'strokeOpacity', 'fillOpacity', 'opacity', 'strokeWidth', 'strokeCap'];

function key(item) {
  var value = item.size;
  value *= 6;
  value += shapeMap[item.shape];
  value *= 20;
  value += item.strokeWidth;
  return value;
}

export default markItemPath('symbol', symbol, key);
