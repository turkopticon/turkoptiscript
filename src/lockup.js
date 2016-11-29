import { make, get, format } from './utils/index'

export class Lockup {
  constructor() {
    this.references = {};
    this.idol       = createLockup();
  }

  bind(data) {
    this.clone = this.idol.cloneNode(true);
    [].forEach.call(get('.to-fc', this.clone).children, el => el.classList.toggle('hidden'));
    get('a.hidden', this.clone).classList.toggle('hidden');

    const { aggregates:agg } = data;
    ['all', 'recent'].forEach(range => {
      Object.keys(agg[range]).forEach(attr => {
        const val      = agg[range][attr],
              crude    = val instanceof Array || attr === 'pending';
        get(`[data-range=${range}][data-attr=${attr}]`, this.clone)
          .textContent = crude ? format(val) : val
      });
    });

    return this;
  }

  attach(location, opts = {}) {
    document.body.appendChild(this.clone);
  }
}

function createLockup() {
  const root   = make('div', { class: 'to-hdi' }),
        lockup = make('div', { class: 'to-lockup' }),
        flex   = lockup.appendChild(make('div', { class: 'to-fc' })),
        labels = ['pay rate', 'time pending', 'response', 'recommend', 'tos', 'broken', 'deceptive'],
        attrs  = ['reward', 'pending', 'comm', 'recommend', 'tos', 'broken', 'deceptive'];

  root.appendChild(make('svg', { height: 20, width: 20 }, 'http://www.w3.org/2000/svg'))
      .appendChild(make('path', {
        fill: '#657b83',
        d   : 'M10 0c-5.52 0-10 4.48-10 10 0 5.52 4.48 10 10 10 5.52 0 10-4.48 10-10 0-5.52-4.48-10-10-10zm4.22 5.38c1.34 0 2.41 0.42 3.22 1.25 0.81 0.83 1.22 2.02 1.22 3.5 0 1.47-0.39 2.61-1.19 3.44-0.8 0.83-1.88 1.25-3.22 1.25-1.36 0-2.45-0.42-3.25-1.25-0.8-0.83-1.19-1.95-1.19-3.41 0-0.93 0.13-1.71 0.41-2.34 0.21-0.46 0.49-0.88 0.84-1.25 0.36-0.37 0.76-0.63 1.19-0.81 0.57-0.24 1.23-0.37 1.97-0.37zm-12.47 0.16h7.25v1.56h-2.72v7.56h-1.84v-7.56h-2.69v-1.56zm12.5 1.44c-0.76 0-1.38 0.26-1.84 0.78-0.46 0.52-0.69 1.29-0.69 2.34 0 1.03 0.21 1.81 0.69 2.34 0.48 0.53 1.11 0.81 1.84 0.81 0.73 0 1.31-0.28 1.78-0.81 0.47-0.53 0.72-1.32 0.72-2.37 0-1.05-0.23-1.83-0.69-2.34-0.46-0.51-1.05-0.75-1.81-0.75z'
      }, 'http://www.w3.org/2000/svg'));
  root.appendChild(lockup);

  let tmp, tagAttrs;
  tmp           = flex.appendChild(make('div'));
  tmp.innerHTML = 'This requester has not been reviewed yet.';
  tmp           = flex.appendChild(make('div', { class: 'hidden' }));
  tmp.innerHTML = '<label>&nbsp;</label>' + labels.map(v => `<span>${v}</span>`).join('');
  ['recent', 'all'].forEach(range => {
    tmp           = flex.appendChild(make('div', { class: 'hidden' }));
    const label   = `<label>${range === 'all' ? 'All time' : 'Last 90 days'}</label>`;
    tmp.innerHTML = label + attrs.map(attr => `<span data-range="${range}" data-attr="${attr}">---</span>`).join('');
  });

  tagAttrs        = { class: 'hidden', 'data-rid': '', 'data-action': 'show', href: 'http://lvh.me:3000/requesters' };
  tmp             = lockup.appendChild(make('a', tagAttrs));
  tmp.textContent = 'View on Turkopticon';
  tagAttrs        = {
    'data-rid'   : '',
    'data-rname' : '',
    'data-title' : '',
    'data-reward': '',
    'data-action': 'new',
    href         : 'http://lvh.me:3000/reviews/new'
  };
  tmp             = lockup.appendChild(make('a', tagAttrs));
  tmp.textContent = 'Add a new review';

  return root;
}