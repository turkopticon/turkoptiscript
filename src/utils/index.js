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

export function format(response) {
  const payRate = (pay, time, total) => ((pay / time) * 60 ** 2).toFixed(2),
        toDays  = (seconds) => (seconds / 86400.0).toFixed(2);
  return !isNaN(response)
    ? `${toDays(response)} days`
    : response.length > 2
           ? `$${payRate(...response)}/hr`
           : `${response[0]} of ${response[1]}`
}