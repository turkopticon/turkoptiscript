import { get } from './utils/index';

export class HITCapsule {
  constructor(el) {
    this.elRef = el;
  }

  init(selector) {
    if (selector) this.elRef = this.elRef.closest(selector);
    return this;
  }

  extract(attrs, strategy, data) {
    const { root, leaf } = strategy,
          method = leaf === 'preview' ? '_extractPreview' : '_extractDefault';
    if (root === 'next')
      Object.assign(this, attrs.reduce((a, b) => (a[b] = data[b]) && a, {}));
    else
      attrs.forEach(attr => this[attr] = this[method](attr, strategy));
    return this;
  }

  _extractDefault(attr, strategy) {
    if (strategy.leaf === 'statusdetail' && attr === 'title')
      return this._get('statusdetailTitleColumnValue').textContent;

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
        return get('input[name=requesterId]').value;
      case 'rname':
        return get('input[name=prevRequester]').value;
      case 'title':
        return this._get('.capsulelink_bold').textContent.trim();
    }
  }

  _get(selector) {
    return get(selector, this.elRef);
  }
}