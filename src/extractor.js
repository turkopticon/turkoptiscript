import { get } from './utils/index';
import { HITCapsule, Lockup } from './index';

export class Extractor {
  constructor() {
    this._selector = new Selector();
  }

  init() {
    this.env     = Extractor.getEnv();
    this._lockup = new Lockup(this.env);
    this._selector.init(this.env);

    const isNext = this.env.root === 'next',
          model  = isNext ? JSON.parse(get(this._selector.anchor).closest('div').dataset['reactProps']) : null;
    this._data   = model ? Extractor.pruneReactModel(model, this.env) : null;
    return this;
  }

  collect(fn) {
    let collection;
    if (fn && typeof fn === 'function')
      collection = fn(this._selector.anchor);
    else throw new TypeError('expected a function');

    const keys      = 'title rname rid reward'.split(' ');
    this.collection = collection
      .map((c, i) => {
        const data = this._data ? this._data[i] : null;
        return new HITCapsule(c, this._lockup)
          .init(this._selector.base)
          .extract(keys, this.env, data);
      })
      .reduce((a, b) => (a[b.attrs.rid] ? a[b.attrs.rid].push(b) : (a[b.attrs.rid] = [b])) && a, {});
    return this;
  }

  static getEnv() {
    const strat = { root: 'legacy', leaf: 'default' },
          path  = document.location.pathname;
    if (document.domain.includes('worker') || get('body > .container-fluid'))
      strat.root = 'next';
    if (path.includes('statusdetail'))
      strat.leaf = 'statusdetail';
    else if (/(myhits|tasks)/.test(path))
      strat.leaf = 'queue';
    else if (get('#theTime'))
      strat.leaf = 'preview';
    return strat;
  }

  static pruneReactModel(model, env) {
    return model['bodyData'].map(d => {
      const src = env.leaf === 'queue' ? d['project'] : d;

      const { monetary_reward: { amount_in_dollars:reward }, requester_id:rid, title, requester_name:rname } = src;

      return { rid: rid, rname: rname, title: title, reward: reward };
    });
  }

}

class Selector {
  constructor() {
    this.selectors = {
      next  : {
        default: { anchor: 'li.table-row', base: null },
        queue  : { anchor: 'li.table-row', base: null }
      },
      legacy: {
        default     : { anchor: '.requesterIdentity', base: 'table[height]' },
        preview     : { anchor: 'a[id|="requester.tooltip"]', base: 'table[style]' },
        queue       : { anchor: '.requesterIdentity', base: 'table[height]' },
        statusdetail: {
          anchor: '.statusdetailRequesterColumnValue',
          base  : 'tr',
          inject: '.statusdetailRequesterColumnValue'
        }
      }
    };
  }

  init(env) { this.env = env; }

  get anchor() {
    const { root, leaf } = this.env;
    return this.selectors[root][leaf].anchor;
  }

  get base() {
    const { root, leaf } = this.env;
    return this.selectors[root][leaf].base;
  }

  get inject() {
    const { root, leaf } = this.env;
    return this.selectors[root][leaf].inject || '.capsule_field_text';
  }
}