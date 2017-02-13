import { make, qs, format, qsa } from './utils/index'

export class Lockup {
  constructor(env) {
    this.env  = env;
    this.idol = createLockup(env);
  }

  inject({ aggregates:agg }, scrapeData) {
    this.clone     = this.idol.cloneNode(true);
    const selector = '.to-fc';

    if (agg) {
      [].forEach.call(qs(selector, this.clone).children, el => el.classList.toggle('hidden'));
      qs('a.hidden', this.clone).classList.toggle('hidden');
      ['all', 'recent'].forEach(range => {
        Object.keys(agg[range]).forEach(attr => {
          const val      = agg[range][attr],
                crude    = val instanceof Array || attr === 'pending';
          qs(`[data-range=${range}][data-attr=${attr}]`, this.clone)
            .textContent = crude ? format(val) : val
        });
      });
    }

    [].forEach.call(qsa('a', this.clone), el => buildLink(el, k => scrapeData[k]));
    qs('.to-rn', this.clone).textContent = scrapeData.rname;
    return this;
  }

  attach(context) {
    const ref = context instanceof HTMLLIElement
      ? qs('span>span', context)
      : (qs('.capsule_field_text', context) || qs('a', context));
    ref.parentNode.insertBefore(this.clone, ref);
  }
}

function createLockup(env) {
  const
    pos    = env.root === 'legacy' ? 'to-rel' : 'to-abs',
    root   = make('div', { class: `to-hdi ${pos}` }),
    lockup = make('div', { class: 'to-lockup to-abs' }),
    flex   = lockup.appendChild(make('div', { class: 'to-fc' })),
    labels = ['pay rate', 'time pending', 'response', 'recommend', 'tos', 'broken'],
    attrs  = ['reward', 'pending', 'comm', 'recommend', 'tos', 'broken', 'deceptive'];

  root.appendChild(make('svg', { height: 20, width: 20 }, 'http://www.w3.org/2000/svg'))
      .appendChild(make('path', {
        fill: '#657b83',
        d   : 'M10 0c-5.52 0-10 4.48-10 10 0 5.52 4.48 10 10 10 5.52 0 10-4.48 10-10 0-5.52-4.48-10-10-10zm4.22 5.38c1.34 0 2.41 0.42 3.22 1.25 0.81 0.83 1.22 2.02 1.22 3.5 0 1.47-0.39 2.61-1.19 3.44-0.8 0.83-1.88 1.25-3.22 1.25-1.36 0-2.45-0.42-3.25-1.25-0.8-0.83-1.19-1.95-1.19-3.41 0-0.93 0.13-1.71 0.41-2.34 0.21-0.46 0.49-0.88 0.84-1.25 0.36-0.37 0.76-0.63 1.19-0.81 0.57-0.24 1.23-0.37 1.97-0.37zm-12.47 0.16h7.25v1.56h-2.72v7.56h-1.84v-7.56h-2.69v-1.56zm12.5 1.44c-0.76 0-1.38 0.26-1.84 0.78-0.46 0.52-0.69 1.29-0.69 2.34 0 1.03 0.21 1.81 0.69 2.34 0.48 0.53 1.11 0.81 1.84 0.81 0.73 0 1.31-0.28 1.78-0.81 0.47-0.53 0.72-1.32 0.72-2.37 0-1.05-0.23-1.83-0.69-2.34-0.46-0.51-1.05-0.75-1.81-0.75z'
      }, 'http://www.w3.org/2000/svg'));
  root.appendChild(lockup);
  lockup.insertBefore(make('div', { class: 'to-rn' }), flex);

  let tmp, tagAttrs;
  tmp           = flex.appendChild(make('div', { style: 'margin:10px 0 0' }));
  tmp.innerHTML = 'This requester has not been reviewed yet.';

  tmp           = flex.appendChild(make('div', { class: 'hidden' }));
  tmp.innerHTML = '<span class="to-th">&nbsp;</span>' + labels.map(v => `<span>${v}</span>`).join('');

  ['recent', 'all'].forEach(range => {
    tmp           = flex.appendChild(make('div', { class: 'hidden' }));
    const label   = `<span class="to-th">${range === 'all' ? 'All time' : 'Last 90 days'}</span>`;
    let inner     = attrs.map((attr, i) => `<span data-range="${range}" data-attr="${attr}">---</span>`);
    tmp.innerHTML = label + inner.join('');
  });

  tagAttrs = {
    class      : 'hidden',
    'data-rid' : '',
    'data-path': '/requesters',
    target     : '_blank',
  };
  tmp             = lockup.appendChild(make('a', tagAttrs));
  tmp.textContent = 'View on Turkopticon';

  tagAttrs        = {
    'data-rid'   : '',
    'data-rname' : '',
    'data-title' : '',
    'data-reward': '',
    'data-path'  : '/reviews/new',
    target       : '_blank',
  };
  tmp             = lockup.appendChild(make('a', tagAttrs));
  tmp.textContent = 'Add a new review';

  return root;
}

function buildLink(el, cb) {
  const ds   = Object.keys(el.dataset).filter(k => k !== 'path'),
        href = 'https://turkopticon.info' + el.dataset.path;

  ds.forEach(k => el.dataset[k] = cb(k));
  if (el.dataset.path === '/requesters')
    el.href = href + '/' + ds.map(k => el.dataset[k]).join('/');
  else
    el.href = href + '?' + ds.map(k => `${k}=${el.dataset[k]}`).join('&');

  return el;
}
