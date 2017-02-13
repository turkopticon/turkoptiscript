import { qs } from './utils/index';

export class HITCapsule {
  constructor(el, lockup) {
    this.elRef = el;
    this.attrs   = {};
    this._lockup = lockup;
  }

  init(selector) {
    if (selector) this.elRef = this.elRef.closest(selector);
    return this;
  }

  inject(data) { this._lockup.inject(data || {}, this.attrs).attach(this.elRef); }

  extract(attrs, env, data) {
    const { root, leaf } = env,
          method = leaf === 'preview' ? '_extractPreview' : '_extractDefault';
    if (root === 'next')
      Object.assign(this.attrs, attrs.reduce((a, b) => (a[b] = data[b]) && a, {}));
    else
      attrs.forEach(attr => this.attrs[attr] = this[method](attr, env));
    return this;
  }

  _extractDefault(attr, env) {
    if (env.leaf === 'statusdetail' && attr === 'title')
      return this._get('.statusdetailTitleColumnValue').textContent;

    switch (attr) {
      case 'reward':
        return this._get('span.reward').textContent.slice(1);
      case 'rid':
        return this._get('[href*="requesterId"]').href.match(/requesterId=([^=&]+)/)[1];
      case 'rname':
        return this._get('.requesterIdentity').textContent;
      case 'title':
        return this._get('a.capsulelink').textContent.trim();
    }
  }

  _extractPreview(attr) {
    switch (attr) {
      case 'reward':
        return this._get('span.reward').textContent.slice(1);
      case 'rid':
        return qs('input[name=requesterId]').value;
      case 'rname':
        return qs('input[name=prevRequester]').value;
      case 'title':
        return this._get('.capsulelink_bold').textContent.trim();
    }
  }

  _get(selector) { return qs(selector, this.elRef); }
}