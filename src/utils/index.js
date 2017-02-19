export function qs(...args) {
  return (args[1] || document).querySelector(args[0]);
}

export function qsa(...args) {
  return Array.from((args[1] || document).querySelectorAll(args[0]));
}

export function make(tag, attrs = {}, namespace) {
  const el = namespace ? document.createElementNS(namespace, tag) : document.createElement(tag);
  Object.keys(attrs).forEach(attr => el.setAttribute(attr, attrs[attr]));
  return el;
}

export function format(data, attr) {
  const payRate = (p, t, total) => t > 0 ? '$' + ((p/t)*60**2).toFixed(2) : '--',
        toDays  = (t) => t > 0 ? (t/86400.0).toFixed(2) : '--',
        percent = (x,n) => n > 0 ? Math.round(100*x/n) + '%' : '--';

  switch (attr) {
    case 'pending':
      return `${toDays(data)} days`;
    case 'reward':
      return `${payRate(...data)}/hr`;
    case 'tos':
    case 'broken':
    case 'rejected':
      return data[0];
    default:
      return `${percent(data[0],data[1])} of ${data[1]}`
  }
}