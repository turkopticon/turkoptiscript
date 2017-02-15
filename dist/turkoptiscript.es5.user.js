// ==UserScript==
// @name         turkoptiscript
// @author       feihtality
// @namespace    https://greasyfork.org/en/users/12709
// @version      1.0.0-rc0
// @description  Review requesters on Amazon Mechanical Turk
// @license      ISC
// @include      https://*.mturk.com/*
// @exclude      https://www.mturk.com/mturk/findhits?*hit_scraper
// @grant        none
// ==/UserScript==
(function () {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function qs() {
  return ((arguments.length <= 1 ? undefined : arguments[1]) || document).querySelector(arguments.length <= 0 ? undefined : arguments[0]);
}

function qsa() {
  return Array.from(((arguments.length <= 1 ? undefined : arguments[1]) || document).querySelectorAll(arguments.length <= 0 ? undefined : arguments[0]));
}

function make(tag) {
  var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var namespace = arguments[2];

  var el = namespace ? document.createElementNS(namespace, tag) : document.createElement(tag);
  Object.keys(attrs).forEach(function (attr) {
    return el.setAttribute(attr, attrs[attr]);
  });
  return el;
}

function format(response) {
  var payRate = function payRate(pay, time, total) {
    return (pay / time * 60 ** 2).toFixed(2);
  },
      toDays = function toDays(seconds) {
    return (seconds / 86400.0).toFixed(2);
  };
  return !isNaN(response) ? toDays(response) + " days" : response.length > 2 ? "$" + payRate.apply(undefined, toConsumableArray(response)) + "/hr" : response[0] + " of " + response[1];
}

var HITCapsule = function () {
  function HITCapsule(el, lockup) {
    classCallCheck(this, HITCapsule);

    this.elRef = el;
    this.attrs = {};
    this._lockup = lockup;
  }

  createClass(HITCapsule, [{
    key: 'init',
    value: function init(selector) {
      if (selector) this.elRef = this.elRef.closest(selector);
      return this;
    }
  }, {
    key: 'inject',
    value: function inject(data) {
      this._lockup.inject(data || {}, this.attrs).attach(this.elRef);
    }
  }, {
    key: 'extract',
    value: function extract(attrs, env, data) {
      var _this = this;

      var root = env.root,
          leaf = env.leaf,
          method = leaf === 'preview' ? '_extractPreview' : '_extractDefault';

      if (root === 'next') Object.assign(this.attrs, attrs.reduce(function (a, b) {
        return (a[b] = data[b]) && a;
      }, {}));else attrs.forEach(function (attr) {
        return _this.attrs[attr] = _this[method](attr, env);
      });
      return this;
    }
  }, {
    key: '_extractDefault',
    value: function _extractDefault(attr, env) {
      if (env.leaf === 'statusdetail' && attr === 'title') return this._get('.statusdetailTitleColumnValue').textContent;

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
  }, {
    key: '_extractPreview',
    value: function _extractPreview(attr) {
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
  }, {
    key: '_get',
    value: function _get(selector) {
      return qs(selector, this.elRef);
    }
  }]);
  return HITCapsule;
}();

var Extractor$$1 = function () {
  function Extractor$$1() {
    classCallCheck(this, Extractor$$1);

    this._selector = new Selector();
  }

  createClass(Extractor$$1, [{
    key: 'init',
    value: function init() {
      this.env = Extractor$$1.getEnv();
      this._lockup = new Lockup(this.env);
      this._selector.init(this.env);

      var isNext = this.env.root === 'next',
          model = isNext ? JSON.parse(qs(this._selector.anchor).closest('div').dataset['reactProps']) : null;
      this._data = model ? Extractor$$1.pruneReactModel(model, this.env) : null;
      return this;
    }
  }, {
    key: 'collect',
    value: function collect(fn) {
      var _this = this;

      var collection = void 0;
      if (fn && typeof fn === 'function') collection = fn(this._selector.anchor);else throw new TypeError('expected a function');

      var keys = 'title rname rid reward'.split(' ');
      this.collection = collection.map(function (c, i) {
        var data = _this._data ? _this._data[i] : null;
        return new HITCapsule(c, _this._lockup).init(_this._selector.base).extract(keys, _this.env, data);
      }).reduce(function (a, b) {
        return (a[b.attrs.rid] ? a[b.attrs.rid].push(b) : a[b.attrs.rid] = [b]) && a;
      }, {});
      return this;
    }
  }], [{
    key: 'getEnv',
    value: function getEnv() {
      var strat = { root: 'legacy', leaf: 'default' },
          path = document.location.pathname;
      if (document.domain.includes('worker') || qs('body > .container-fluid')) strat.root = 'next';
      if (path.includes('statusdetail')) strat.leaf = 'statusdetail';else if (/(myhits|tasks)/.test(path)) strat.leaf = 'queue';else if (qs('#theTime')) strat.leaf = 'preview';
      return strat;
    }
  }, {
    key: 'pruneReactModel',
    value: function pruneReactModel(model, env) {
      return model['bodyData'].map(function (d) {
        var src = env.leaf === 'queue' ? d['project'] : d;

        var reward = src.monetary_reward.amount_in_dollars,
            rid = src.requester_id,
            title = src.title,
            rname = src.requester_name;

        return { rid: rid, rname: rname, title: title, reward: reward };
      });
    }
  }]);
  return Extractor$$1;
}();

var Selector = function () {
  function Selector() {
    classCallCheck(this, Selector);

    this.selectors = {
      next: {
        default: { anchor: 'li.table-row', base: null },
        queue: { anchor: 'li.table-row', base: null }
      },
      legacy: {
        default: { anchor: '.requesterIdentity', base: 'table[height]' },
        preview: { anchor: 'a[id|="requester.tooltip"]', base: 'table[style]' },
        queue: { anchor: '.requesterIdentity', base: 'table[height]' },
        statusdetail: {
          anchor: '.statusdetailRequesterColumnValue',
          base: 'tr',
          inject: '.statusdetailRequesterColumnValue'
        }
      }
    };
  }

  createClass(Selector, [{
    key: 'init',
    value: function init(env) {
      this.env = env;
    }
  }, {
    key: 'anchor',
    get: function get() {
      var _env = this.env,
          root = _env.root,
          leaf = _env.leaf;

      return this.selectors[root][leaf].anchor;
    }
  }, {
    key: 'base',
    get: function get() {
      var _env2 = this.env,
          root = _env2.root,
          leaf = _env2.leaf;

      return this.selectors[root][leaf].base;
    }
  }, {
    key: 'inject',
    get: function get() {
      var _env3 = this.env,
          root = _env3.root,
          leaf = _env3.leaf;

      return this.selectors[root][leaf].inject || '.capsule_field_text';
    }
  }]);
  return Selector;
}();

var Lockup = function () {
  function Lockup(env) {
    classCallCheck(this, Lockup);

    this.env = env;
    this.idol = createLockup(env);
  }

  createClass(Lockup, [{
    key: 'inject',
    value: function inject(_ref, scrapeData) {
      var _this = this;

      var agg = _ref.aggregates;

      this.clone = this.idol.cloneNode(true);
      var selector = '.to-fc';

      if (agg) {
        [].forEach.call(qs(selector, this.clone).children, function (el) {
          return el.classList.toggle('hidden');
        });
        qs('a.hidden', this.clone).classList.toggle('hidden');
        ['all', 'recent'].forEach(function (range) {
          Object.keys(agg[range]).forEach(function (attr) {
            var val = agg[range][attr],
                crude = val instanceof Array || attr === 'pending';
            qs('[data-range=' + range + '][data-attr=' + attr + ']', _this.clone).textContent = crude ? format(val) : val;
          });
        });
      }

      [].forEach.call(qsa('a', this.clone), function (el) {
        return buildLink(el, function (k) {
          return scrapeData[k];
        });
      });
      qs('.to-rn', this.clone).textContent = scrapeData.rname;
      return this;
    }
  }, {
    key: 'attach',
    value: function attach(context) {
      var ref = context instanceof HTMLLIElement ? qs('span>span', context) : qs('.capsule_field_text', context) || qs('a', context);
      ref.parentNode.insertBefore(this.clone, ref);
    }
  }]);
  return Lockup;
}();

function createLockup(env) {
  var pos = env.root === 'legacy' ? 'to-rel' : 'to-abs',
      root = make('div', { class: 'to-hdi ' + pos }),
      lockup = make('div', { class: 'to-lockup to-abs' }),
      flex = lockup.appendChild(make('div', { class: 'to-fc' })),
      labels = ['pay rate', 'time pending', 'response', 'recommend', 'tos', 'broken'],
      attrs = ['reward', 'pending', 'comm', 'recommend', 'tos', 'broken'];

  root.appendChild(make('svg', { height: 20, width: 20 }, 'http://www.w3.org/2000/svg')).appendChild(make('path', {
    fill: '#657b83',
    d: 'M10 0c-5.52 0-10 4.48-10 10 0 5.52 4.48 10 10 10 5.52 0 10-4.48 10-10 0-5.52-4.48-10-10-10zm4.22 5.38c1.34 0 2.41 0.42 3.22 1.25 0.81 0.83 1.22 2.02 1.22 3.5 0 1.47-0.39 2.61-1.19 3.44-0.8 0.83-1.88 1.25-3.22 1.25-1.36 0-2.45-0.42-3.25-1.25-0.8-0.83-1.19-1.95-1.19-3.41 0-0.93 0.13-1.71 0.41-2.34 0.21-0.46 0.49-0.88 0.84-1.25 0.36-0.37 0.76-0.63 1.19-0.81 0.57-0.24 1.23-0.37 1.97-0.37zm-12.47 0.16h7.25v1.56h-2.72v7.56h-1.84v-7.56h-2.69v-1.56zm12.5 1.44c-0.76 0-1.38 0.26-1.84 0.78-0.46 0.52-0.69 1.29-0.69 2.34 0 1.03 0.21 1.81 0.69 2.34 0.48 0.53 1.11 0.81 1.84 0.81 0.73 0 1.31-0.28 1.78-0.81 0.47-0.53 0.72-1.32 0.72-2.37 0-1.05-0.23-1.83-0.69-2.34-0.46-0.51-1.05-0.75-1.81-0.75z'
  }, 'http://www.w3.org/2000/svg'));
  root.appendChild(lockup);
  lockup.insertBefore(make('div', { class: 'to-rn' }), flex);

  var tmp = void 0,
      tagAttrs = void 0;
  tmp = flex.appendChild(make('div', { style: 'margin:10px 0 0' }));
  tmp.innerHTML = 'This requester has not been reviewed yet.';

  tmp = flex.appendChild(make('div', { class: 'hidden' }));
  tmp.innerHTML = '<span class="to-th">&nbsp;</span>' + labels.map(function (v) {
    return '<span>' + v + '</span>';
  }).join('');

  ['recent', 'all'].forEach(function (range) {
    tmp = flex.appendChild(make('div', { class: 'hidden' }));
    var label = '<span class="to-th">' + (range === 'all' ? 'All time' : 'Last 90 days') + '</span>';
    var inner = attrs.map(function (attr, i) {
      return '<span data-range="' + range + '" data-attr="' + attr + '">---</span>';
    });
    tmp.innerHTML = label + inner.join('');
  });

  tagAttrs = {
    class: 'hidden',
    'data-rid': '',
    'data-path': '/requesters',
    target: '_blank'
  };
  tmp = lockup.appendChild(make('a', tagAttrs));
  tmp.textContent = 'View on Turkopticon';

  tagAttrs = {
    'data-rid': '',
    'data-rname': '',
    'data-title': '',
    'data-reward': '',
    'data-path': '/reviews/new',
    target: '_blank'
  };
  tmp = lockup.appendChild(make('a', tagAttrs));
  tmp.textContent = 'Add a new review';

  return root;
}

function buildLink(el, cb) {
  var ds = Object.keys(el.dataset).filter(function (k) {
    return k !== 'path';
  }),
      href = 'https://turkopticon.info' + el.dataset.path;

  ds.forEach(function (k) {
    return el.dataset[k] = cb(k);
  });
  if (el.dataset.path === '/requesters') el.href = href + '/' + ds.map(function (k) {
    return el.dataset[k];
  }).join('/');else el.href = href + '?' + ds.map(function (k) {
    return k + '=' + el.dataset[k];
  }).join('&');

  return el;
}

var ApiQuery = function () {
  function ApiQuery(action, method) {
    classCallCheck(this, ApiQuery);

    this.URI = 'https://api.turkopticon.info/' + (action || '');
    this.method = method || 'GET';
    this.version = '2.0-alpha';
  }

  createClass(ApiQuery, [{
    key: 'send',
    value: function send(params) {
      var _this = this;

      this.params = params ? new Params(params) : null;

      return new Promise(function (accept, reject) {
        var xhr = new XMLHttpRequest(),
            url = _this.params ? _this.URI + '?' + _this.params.toString() : _this.URI;
        xhr.open(_this.method, url);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Accept', 'application/vnd.turkopticon.v' + _this.version + '+json');
        xhr.send();
        xhr.onload = function (_ref) {
          var response = _ref.target.response;
          return accept(response);
        };
        xhr.onerror = function (e) {
          return reject(e);
        };
      });
    }
  }]);
  return ApiQuery;
}();

var Params = function () {
  function Params(params) {
    classCallCheck(this, Params);
    this.params = params;
  }

  createClass(Params, [{
    key: 'toString',
    value: function toString() {
      return Params.toParams(this.params);
    }
  }], [{
    key: 'toParams',
    value: function toParams(obj, scope) {
      if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && !(obj instanceof Array)) return Object.keys(obj).map(function (k) {
        return Params.toParams(obj[k], scope ? scope + '[' + k + ']' : k);
      }).join('&');else return scope + '=' + obj.toString();
    }
  }]);
  return Params;
}();

try {
  (function () {
    appendCss();
    var extr = new Extractor$$1().init().collect(qsa),
        rids = Object.keys(extr.collection);

    new ApiQuery('requesters').send({ rids: rids, fields: { requesters: ['rid', 'aggregates'] } }).then(function (response) {
      return response.data.reduce(function (a, b) {
        return (a[b.attributes.rid] = b.attributes) && a;
      }, {});
    }).then(function (data) {
      return rids.forEach(function (rid) {
        return extr.collection[rid].forEach(function (capsule) {
          return capsule.inject(data[rid]);
        });
      });
    }).catch(console.error.bind(console, '#apierror'));
  })();
} catch (err) {
  console.error(err);
}

function appendCss() {
  var style = document.head.appendChild(make('style'));
  style.innerHTML = '\n  .to-rel { position:relative; }\n  .to-abs { position:absolute; }\n  .to-hdi { display:inline-block; font-size:12px; cursor:default; line-height:14px; }\n  .to-hdi:hover > svg { float:left; z-index:3; position:relative; }\n  .to-hdi:hover > .to-lockup { display:block; z-index:2; }\n  .to-hdi .hidden, .to-nhdi .hidden { display:none }\n  .to-nhdi { font-size:12px; }\n  .to-lockup { display:none; width:300px; top:-1px; left:-5px; background:#fff; padding:5px; box-shadow:0px 2px 10px 1px rgba(0,0,0,0.7); }\n  .to-lockup a { display:inline-block; width:50%; text-align:center; margin-top:10px; color:crimson; }\n  .to-rn { margin:0 0 3px 25px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n  .to-fc { display:flex; }\n  .to-fc > div { flex:1; }\n  .to-fc .to-th { font-weight:700; width:100%; background:#6a8ca3; color:#fff }\n  .to-fc span { display:block; padding:3px 0; margin:0; }\n';
}

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1VzZXJzL1l1YW5rYWkvUHJvamVjdHMvdHVya29wdGljb24vdHVya29wdGlzY3JpcHQvc3JjL3V0aWxzL2luZGV4LmpzIiwiQzovVXNlcnMvWXVhbmthaS9Qcm9qZWN0cy90dXJrb3B0aWNvbi90dXJrb3B0aXNjcmlwdC9zcmMvaGl0LWNhcHN1bGUuanMiLCJDOi9Vc2Vycy9ZdWFua2FpL1Byb2plY3RzL3R1cmtvcHRpY29uL3R1cmtvcHRpc2NyaXB0L3NyYy9leHRyYWN0b3IuanMiLCJDOi9Vc2Vycy9ZdWFua2FpL1Byb2plY3RzL3R1cmtvcHRpY29uL3R1cmtvcHRpc2NyaXB0L3NyYy9sb2NrdXAuanMiLCJDOi9Vc2Vycy9ZdWFua2FpL1Byb2plY3RzL3R1cmtvcHRpY29uL3R1cmtvcHRpc2NyaXB0L3NyYy9hcGktcXVlcnkuanMiLCJDOi9Vc2Vycy9ZdWFua2FpL1Byb2plY3RzL3R1cmtvcHRpY29uL3R1cmtvcHRpc2NyaXB0L2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBxcyguLi5hcmdzKSB7XG4gIHJldHVybiAoYXJnc1sxXSB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvcihhcmdzWzBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHFzYSguLi5hcmdzKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKChhcmdzWzFdIHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKGFyZ3NbMF0pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2UodGFnLCBhdHRycyA9IHt9LCBuYW1lc3BhY2UpIHtcbiAgY29uc3QgZWwgPSBuYW1lc3BhY2UgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCB0YWcpIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICBPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChhdHRyID0+IGVsLnNldEF0dHJpYnV0ZShhdHRyLCBhdHRyc1thdHRyXSkpO1xuICByZXR1cm4gZWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXQocmVzcG9uc2UpIHtcbiAgY29uc3QgcGF5UmF0ZSA9IChwYXksIHRpbWUsIHRvdGFsKSA9PiAoKHBheSAvIHRpbWUpICogNjAgKiogMikudG9GaXhlZCgyKSxcbiAgICAgICAgdG9EYXlzICA9IChzZWNvbmRzKSA9PiAoc2Vjb25kcyAvIDg2NDAwLjApLnRvRml4ZWQoMik7XG4gIHJldHVybiAhaXNOYU4ocmVzcG9uc2UpXG4gICAgPyBgJHt0b0RheXMocmVzcG9uc2UpfSBkYXlzYFxuICAgIDogcmVzcG9uc2UubGVuZ3RoID4gMlxuICAgICAgICAgICA/IGAkJHtwYXlSYXRlKC4uLnJlc3BvbnNlKX0vaHJgXG4gICAgICAgICAgIDogYCR7cmVzcG9uc2VbMF19IG9mICR7cmVzcG9uc2VbMV19YFxufSIsImltcG9ydCB7IHFzIH0gZnJvbSAnLi91dGlscy9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBISVRDYXBzdWxlIHtcbiAgY29uc3RydWN0b3IoZWwsIGxvY2t1cCkge1xuICAgIHRoaXMuZWxSZWYgPSBlbDtcbiAgICB0aGlzLmF0dHJzICAgPSB7fTtcbiAgICB0aGlzLl9sb2NrdXAgPSBsb2NrdXA7XG4gIH1cblxuICBpbml0KHNlbGVjdG9yKSB7XG4gICAgaWYgKHNlbGVjdG9yKSB0aGlzLmVsUmVmID0gdGhpcy5lbFJlZi5jbG9zZXN0KHNlbGVjdG9yKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGluamVjdChkYXRhKSB7IHRoaXMuX2xvY2t1cC5pbmplY3QoZGF0YSB8fCB7fSwgdGhpcy5hdHRycykuYXR0YWNoKHRoaXMuZWxSZWYpOyB9XG5cbiAgZXh0cmFjdChhdHRycywgZW52LCBkYXRhKSB7XG4gICAgY29uc3QgeyByb290LCBsZWFmIH0gPSBlbnYsXG4gICAgICAgICAgbWV0aG9kID0gbGVhZiA9PT0gJ3ByZXZpZXcnID8gJ19leHRyYWN0UHJldmlldycgOiAnX2V4dHJhY3REZWZhdWx0JztcbiAgICBpZiAocm9vdCA9PT0gJ25leHQnKVxuICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmF0dHJzLCBhdHRycy5yZWR1Y2UoKGEsIGIpID0+IChhW2JdID0gZGF0YVtiXSkgJiYgYSwge30pKTtcbiAgICBlbHNlXG4gICAgICBhdHRycy5mb3JFYWNoKGF0dHIgPT4gdGhpcy5hdHRyc1thdHRyXSA9IHRoaXNbbWV0aG9kXShhdHRyLCBlbnYpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9leHRyYWN0RGVmYXVsdChhdHRyLCBlbnYpIHtcbiAgICBpZiAoZW52LmxlYWYgPT09ICdzdGF0dXNkZXRhaWwnICYmIGF0dHIgPT09ICd0aXRsZScpXG4gICAgICByZXR1cm4gdGhpcy5fZ2V0KCcuc3RhdHVzZGV0YWlsVGl0bGVDb2x1bW5WYWx1ZScpLnRleHRDb250ZW50O1xuXG4gICAgc3dpdGNoIChhdHRyKSB7XG4gICAgICBjYXNlICdyZXdhcmQnOlxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdzcGFuLnJld2FyZCcpLnRleHRDb250ZW50LnNsaWNlKDEpO1xuICAgICAgY2FzZSAncmlkJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnW2hyZWYqPVwicmVxdWVzdGVySWRcIl0nKS5ocmVmLm1hdGNoKC9yZXF1ZXN0ZXJJZD0oW149Jl0rKS8pWzFdO1xuICAgICAgY2FzZSAncm5hbWUnOlxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCcucmVxdWVzdGVySWRlbnRpdHknKS50ZXh0Q29udGVudDtcbiAgICAgIGNhc2UgJ3RpdGxlJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnYS5jYXBzdWxlbGluaycpLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICB9XG4gIH1cblxuICBfZXh0cmFjdFByZXZpZXcoYXR0cikge1xuICAgIHN3aXRjaCAoYXR0cikge1xuICAgICAgY2FzZSAncmV3YXJkJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnc3Bhbi5yZXdhcmQnKS50ZXh0Q29udGVudC5zbGljZSgxKTtcbiAgICAgIGNhc2UgJ3JpZCc6XG4gICAgICAgIHJldHVybiBxcygnaW5wdXRbbmFtZT1yZXF1ZXN0ZXJJZF0nKS52YWx1ZTtcbiAgICAgIGNhc2UgJ3JuYW1lJzpcbiAgICAgICAgcmV0dXJuIHFzKCdpbnB1dFtuYW1lPXByZXZSZXF1ZXN0ZXJdJykudmFsdWU7XG4gICAgICBjYXNlICd0aXRsZSc6XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJy5jYXBzdWxlbGlua19ib2xkJykudGV4dENvbnRlbnQudHJpbSgpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXQoc2VsZWN0b3IpIHsgcmV0dXJuIHFzKHNlbGVjdG9yLCB0aGlzLmVsUmVmKTsgfVxufSIsImltcG9ydCB7IHFzIH0gZnJvbSAnLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBISVRDYXBzdWxlLCBMb2NrdXAgfSBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIEV4dHJhY3RvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3NlbGVjdG9yID0gbmV3IFNlbGVjdG9yKCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMuZW52ICAgICA9IEV4dHJhY3Rvci5nZXRFbnYoKTtcbiAgICB0aGlzLl9sb2NrdXAgPSBuZXcgTG9ja3VwKHRoaXMuZW52KTtcbiAgICB0aGlzLl9zZWxlY3Rvci5pbml0KHRoaXMuZW52KTtcblxuICAgIGNvbnN0IGlzTmV4dCA9IHRoaXMuZW52LnJvb3QgPT09ICduZXh0JyxcbiAgICAgICAgICBtb2RlbCA9IGlzTmV4dCA/IEpTT04ucGFyc2UocXModGhpcy5fc2VsZWN0b3IuYW5jaG9yKS5jbG9zZXN0KCdkaXYnKS5kYXRhc2V0WydyZWFjdFByb3BzJ10pIDogbnVsbDtcbiAgICB0aGlzLl9kYXRhICAgPSBtb2RlbCA/IEV4dHJhY3Rvci5wcnVuZVJlYWN0TW9kZWwobW9kZWwsIHRoaXMuZW52KSA6IG51bGw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjb2xsZWN0KGZuKSB7XG4gICAgbGV0IGNvbGxlY3Rpb247XG4gICAgaWYgKGZuICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgIGNvbGxlY3Rpb24gPSBmbih0aGlzLl9zZWxlY3Rvci5hbmNob3IpO1xuICAgIGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhwZWN0ZWQgYSBmdW5jdGlvbicpO1xuXG4gICAgY29uc3Qga2V5cyAgICAgID0gJ3RpdGxlIHJuYW1lIHJpZCByZXdhcmQnLnNwbGl0KCcgJyk7XG4gICAgdGhpcy5jb2xsZWN0aW9uID0gY29sbGVjdGlvblxuICAgICAgLm1hcCgoYywgaSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5fZGF0YSA/IHRoaXMuX2RhdGFbaV0gOiBudWxsO1xuICAgICAgICByZXR1cm4gbmV3IEhJVENhcHN1bGUoYywgdGhpcy5fbG9ja3VwKVxuICAgICAgICAgIC5pbml0KHRoaXMuX3NlbGVjdG9yLmJhc2UpXG4gICAgICAgICAgLmV4dHJhY3Qoa2V5cywgdGhpcy5lbnYsIGRhdGEpO1xuICAgICAgfSlcbiAgICAgIC5yZWR1Y2UoKGEsIGIpID0+IChhW2IuYXR0cnMucmlkXSA/IGFbYi5hdHRycy5yaWRdLnB1c2goYikgOiAoYVtiLmF0dHJzLnJpZF0gPSBbYl0pKSAmJiBhLCB7fSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdGF0aWMgZ2V0RW52KCkge1xuICAgIGNvbnN0IHN0cmF0ID0geyByb290OiAnbGVnYWN5JywgbGVhZjogJ2RlZmF1bHQnIH0sXG4gICAgICAgICAgcGF0aCAgPSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICBpZiAoZG9jdW1lbnQuZG9tYWluLmluY2x1ZGVzKCd3b3JrZXInKSB8fCBxcygnYm9keSA+IC5jb250YWluZXItZmx1aWQnKSlcbiAgICAgIHN0cmF0LnJvb3QgPSAnbmV4dCc7XG4gICAgaWYgKHBhdGguaW5jbHVkZXMoJ3N0YXR1c2RldGFpbCcpKVxuICAgICAgc3RyYXQubGVhZiA9ICdzdGF0dXNkZXRhaWwnO1xuICAgIGVsc2UgaWYgKC8obXloaXRzfHRhc2tzKS8udGVzdChwYXRoKSlcbiAgICAgIHN0cmF0LmxlYWYgPSAncXVldWUnO1xuICAgIGVsc2UgaWYgKHFzKCcjdGhlVGltZScpKVxuICAgICAgc3RyYXQubGVhZiA9ICdwcmV2aWV3JztcbiAgICByZXR1cm4gc3RyYXQ7XG4gIH1cblxuICBzdGF0aWMgcHJ1bmVSZWFjdE1vZGVsKG1vZGVsLCBlbnYpIHtcbiAgICByZXR1cm4gbW9kZWxbJ2JvZHlEYXRhJ10ubWFwKGQgPT4ge1xuICAgICAgY29uc3Qgc3JjID0gZW52LmxlYWYgPT09ICdxdWV1ZScgPyBkWydwcm9qZWN0J10gOiBkO1xuXG4gICAgICBjb25zdCB7IG1vbmV0YXJ5X3Jld2FyZDogeyBhbW91bnRfaW5fZG9sbGFyczpyZXdhcmQgfSwgcmVxdWVzdGVyX2lkOnJpZCwgdGl0bGUsIHJlcXVlc3Rlcl9uYW1lOnJuYW1lIH0gPSBzcmM7XG5cbiAgICAgIHJldHVybiB7IHJpZDogcmlkLCBybmFtZTogcm5hbWUsIHRpdGxlOiB0aXRsZSwgcmV3YXJkOiByZXdhcmQgfTtcbiAgICB9KTtcbiAgfVxuXG59XG5cbmNsYXNzIFNlbGVjdG9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZWxlY3RvcnMgPSB7XG4gICAgICBuZXh0ICA6IHtcbiAgICAgICAgZGVmYXVsdDogeyBhbmNob3I6ICdsaS50YWJsZS1yb3cnLCBiYXNlOiBudWxsIH0sXG4gICAgICAgIHF1ZXVlICA6IHsgYW5jaG9yOiAnbGkudGFibGUtcm93JywgYmFzZTogbnVsbCB9XG4gICAgICB9LFxuICAgICAgbGVnYWN5OiB7XG4gICAgICAgIGRlZmF1bHQgICAgIDogeyBhbmNob3I6ICcucmVxdWVzdGVySWRlbnRpdHknLCBiYXNlOiAndGFibGVbaGVpZ2h0XScgfSxcbiAgICAgICAgcHJldmlldyAgICAgOiB7IGFuY2hvcjogJ2FbaWR8PVwicmVxdWVzdGVyLnRvb2x0aXBcIl0nLCBiYXNlOiAndGFibGVbc3R5bGVdJyB9LFxuICAgICAgICBxdWV1ZSAgICAgICA6IHsgYW5jaG9yOiAnLnJlcXVlc3RlcklkZW50aXR5JywgYmFzZTogJ3RhYmxlW2hlaWdodF0nIH0sXG4gICAgICAgIHN0YXR1c2RldGFpbDoge1xuICAgICAgICAgIGFuY2hvcjogJy5zdGF0dXNkZXRhaWxSZXF1ZXN0ZXJDb2x1bW5WYWx1ZScsXG4gICAgICAgICAgYmFzZSAgOiAndHInLFxuICAgICAgICAgIGluamVjdDogJy5zdGF0dXNkZXRhaWxSZXF1ZXN0ZXJDb2x1bW5WYWx1ZSdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBpbml0KGVudikgeyB0aGlzLmVudiA9IGVudjsgfVxuXG4gIGdldCBhbmNob3IoKSB7XG4gICAgY29uc3QgeyByb290LCBsZWFmIH0gPSB0aGlzLmVudjtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RvcnNbcm9vdF1bbGVhZl0uYW5jaG9yO1xuICB9XG5cbiAgZ2V0IGJhc2UoKSB7XG4gICAgY29uc3QgeyByb290LCBsZWFmIH0gPSB0aGlzLmVudjtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RvcnNbcm9vdF1bbGVhZl0uYmFzZTtcbiAgfVxuXG4gIGdldCBpbmplY3QoKSB7XG4gICAgY29uc3QgeyByb290LCBsZWFmIH0gPSB0aGlzLmVudjtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RvcnNbcm9vdF1bbGVhZl0uaW5qZWN0IHx8ICcuY2Fwc3VsZV9maWVsZF90ZXh0JztcbiAgfVxufSIsImltcG9ydCB7IG1ha2UsIHFzLCBmb3JtYXQsIHFzYSB9IGZyb20gJy4vdXRpbHMvaW5kZXgnXG5cbmV4cG9ydCBjbGFzcyBMb2NrdXAge1xuICBjb25zdHJ1Y3RvcihlbnYpIHtcbiAgICB0aGlzLmVudiAgPSBlbnY7XG4gICAgdGhpcy5pZG9sID0gY3JlYXRlTG9ja3VwKGVudik7XG4gIH1cblxuICBpbmplY3QoeyBhZ2dyZWdhdGVzOmFnZyB9LCBzY3JhcGVEYXRhKSB7XG4gICAgdGhpcy5jbG9uZSAgICAgPSB0aGlzLmlkb2wuY2xvbmVOb2RlKHRydWUpO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gJy50by1mYyc7XG5cbiAgICBpZiAoYWdnKSB7XG4gICAgICBbXS5mb3JFYWNoLmNhbGwocXMoc2VsZWN0b3IsIHRoaXMuY2xvbmUpLmNoaWxkcmVuLCBlbCA9PiBlbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nKSk7XG4gICAgICBxcygnYS5oaWRkZW4nLCB0aGlzLmNsb25lKS5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nKTtcbiAgICAgIFsnYWxsJywgJ3JlY2VudCddLmZvckVhY2gocmFuZ2UgPT4ge1xuICAgICAgICBPYmplY3Qua2V5cyhhZ2dbcmFuZ2VdKS5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbCAgICAgID0gYWdnW3JhbmdlXVthdHRyXSxcbiAgICAgICAgICAgICAgICBjcnVkZSAgICA9IHZhbCBpbnN0YW5jZW9mIEFycmF5IHx8IGF0dHIgPT09ICdwZW5kaW5nJztcbiAgICAgICAgICBxcyhgW2RhdGEtcmFuZ2U9JHtyYW5nZX1dW2RhdGEtYXR0cj0ke2F0dHJ9XWAsIHRoaXMuY2xvbmUpXG4gICAgICAgICAgICAudGV4dENvbnRlbnQgPSBjcnVkZSA/IGZvcm1hdCh2YWwpIDogdmFsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgW10uZm9yRWFjaC5jYWxsKHFzYSgnYScsIHRoaXMuY2xvbmUpLCBlbCA9PiBidWlsZExpbmsoZWwsIGsgPT4gc2NyYXBlRGF0YVtrXSkpO1xuICAgIHFzKCcudG8tcm4nLCB0aGlzLmNsb25lKS50ZXh0Q29udGVudCA9IHNjcmFwZURhdGEucm5hbWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhdHRhY2goY29udGV4dCkge1xuICAgIGNvbnN0IHJlZiA9IGNvbnRleHQgaW5zdGFuY2VvZiBIVE1MTElFbGVtZW50XG4gICAgICA/IHFzKCdzcGFuPnNwYW4nLCBjb250ZXh0KVxuICAgICAgOiAocXMoJy5jYXBzdWxlX2ZpZWxkX3RleHQnLCBjb250ZXh0KSB8fCBxcygnYScsIGNvbnRleHQpKTtcbiAgICByZWYucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5jbG9uZSwgcmVmKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMb2NrdXAoZW52KSB7XG4gIGNvbnN0XG4gICAgcG9zICAgID0gZW52LnJvb3QgPT09ICdsZWdhY3knID8gJ3RvLXJlbCcgOiAndG8tYWJzJyxcbiAgICByb290ICAgPSBtYWtlKCdkaXYnLCB7IGNsYXNzOiBgdG8taGRpICR7cG9zfWAgfSksXG4gICAgbG9ja3VwID0gbWFrZSgnZGl2JywgeyBjbGFzczogJ3RvLWxvY2t1cCB0by1hYnMnIH0pLFxuICAgIGZsZXggICA9IGxvY2t1cC5hcHBlbmRDaGlsZChtYWtlKCdkaXYnLCB7IGNsYXNzOiAndG8tZmMnIH0pKSxcbiAgICBsYWJlbHMgPSBbJ3BheSByYXRlJywgJ3RpbWUgcGVuZGluZycsICdyZXNwb25zZScsICdyZWNvbW1lbmQnLCAndG9zJywgJ2Jyb2tlbiddLFxuICAgIGF0dHJzICA9IFsncmV3YXJkJywgJ3BlbmRpbmcnLCAnY29tbScsICdyZWNvbW1lbmQnLCAndG9zJywgJ2Jyb2tlbiddO1xuXG4gIHJvb3QuYXBwZW5kQ2hpbGQobWFrZSgnc3ZnJywgeyBoZWlnaHQ6IDIwLCB3aWR0aDogMjAgfSwgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJykpXG4gICAgICAuYXBwZW5kQ2hpbGQobWFrZSgncGF0aCcsIHtcbiAgICAgICAgZmlsbDogJyM2NTdiODMnLFxuICAgICAgICBkICAgOiAnTTEwIDBjLTUuNTIgMC0xMCA0LjQ4LTEwIDEwIDAgNS41MiA0LjQ4IDEwIDEwIDEwIDUuNTIgMCAxMC00LjQ4IDEwLTEwIDAtNS41Mi00LjQ4LTEwLTEwLTEwem00LjIyIDUuMzhjMS4zNCAwIDIuNDEgMC40MiAzLjIyIDEuMjUgMC44MSAwLjgzIDEuMjIgMi4wMiAxLjIyIDMuNSAwIDEuNDctMC4zOSAyLjYxLTEuMTkgMy40NC0wLjggMC44My0xLjg4IDEuMjUtMy4yMiAxLjI1LTEuMzYgMC0yLjQ1LTAuNDItMy4yNS0xLjI1LTAuOC0wLjgzLTEuMTktMS45NS0xLjE5LTMuNDEgMC0wLjkzIDAuMTMtMS43MSAwLjQxLTIuMzQgMC4yMS0wLjQ2IDAuNDktMC44OCAwLjg0LTEuMjUgMC4zNi0wLjM3IDAuNzYtMC42MyAxLjE5LTAuODEgMC41Ny0wLjI0IDEuMjMtMC4zNyAxLjk3LTAuMzd6bS0xMi40NyAwLjE2aDcuMjV2MS41NmgtMi43MnY3LjU2aC0xLjg0di03LjU2aC0yLjY5di0xLjU2em0xMi41IDEuNDRjLTAuNzYgMC0xLjM4IDAuMjYtMS44NCAwLjc4LTAuNDYgMC41Mi0wLjY5IDEuMjktMC42OSAyLjM0IDAgMS4wMyAwLjIxIDEuODEgMC42OSAyLjM0IDAuNDggMC41MyAxLjExIDAuODEgMS44NCAwLjgxIDAuNzMgMCAxLjMxLTAuMjggMS43OC0wLjgxIDAuNDctMC41MyAwLjcyLTEuMzIgMC43Mi0yLjM3IDAtMS4wNS0wLjIzLTEuODMtMC42OS0yLjM0LTAuNDYtMC41MS0xLjA1LTAuNzUtMS44MS0wLjc1eidcbiAgICAgIH0sICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycpKTtcbiAgcm9vdC5hcHBlbmRDaGlsZChsb2NrdXApO1xuICBsb2NrdXAuaW5zZXJ0QmVmb3JlKG1ha2UoJ2RpdicsIHsgY2xhc3M6ICd0by1ybicgfSksIGZsZXgpO1xuXG4gIGxldCB0bXAsIHRhZ0F0dHJzO1xuICB0bXAgICAgICAgICAgID0gZmxleC5hcHBlbmRDaGlsZChtYWtlKCdkaXYnLCB7IHN0eWxlOiAnbWFyZ2luOjEwcHggMCAwJyB9KSk7XG4gIHRtcC5pbm5lckhUTUwgPSAnVGhpcyByZXF1ZXN0ZXIgaGFzIG5vdCBiZWVuIHJldmlld2VkIHlldC4nO1xuXG4gIHRtcCAgICAgICAgICAgPSBmbGV4LmFwcGVuZENoaWxkKG1ha2UoJ2RpdicsIHsgY2xhc3M6ICdoaWRkZW4nIH0pKTtcbiAgdG1wLmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cInRvLXRoXCI+Jm5ic3A7PC9zcGFuPicgKyBsYWJlbHMubWFwKHYgPT4gYDxzcGFuPiR7dn08L3NwYW4+YCkuam9pbignJyk7XG5cbiAgWydyZWNlbnQnLCAnYWxsJ10uZm9yRWFjaChyYW5nZSA9PiB7XG4gICAgdG1wICAgICAgICAgICA9IGZsZXguYXBwZW5kQ2hpbGQobWFrZSgnZGl2JywgeyBjbGFzczogJ2hpZGRlbicgfSkpO1xuICAgIGNvbnN0IGxhYmVsICAgPSBgPHNwYW4gY2xhc3M9XCJ0by10aFwiPiR7cmFuZ2UgPT09ICdhbGwnID8gJ0FsbCB0aW1lJyA6ICdMYXN0IDkwIGRheXMnfTwvc3Bhbj5gO1xuICAgIGxldCBpbm5lciAgICAgPSBhdHRycy5tYXAoKGF0dHIsIGkpID0+IGA8c3BhbiBkYXRhLXJhbmdlPVwiJHtyYW5nZX1cIiBkYXRhLWF0dHI9XCIke2F0dHJ9XCI+LS0tPC9zcGFuPmApO1xuICAgIHRtcC5pbm5lckhUTUwgPSBsYWJlbCArIGlubmVyLmpvaW4oJycpO1xuICB9KTtcblxuICB0YWdBdHRycyA9IHtcbiAgICBjbGFzcyAgICAgIDogJ2hpZGRlbicsXG4gICAgJ2RhdGEtcmlkJyA6ICcnLFxuICAgICdkYXRhLXBhdGgnOiAnL3JlcXVlc3RlcnMnLFxuICAgIHRhcmdldCAgICAgOiAnX2JsYW5rJyxcbiAgfTtcbiAgdG1wICAgICAgICAgICAgID0gbG9ja3VwLmFwcGVuZENoaWxkKG1ha2UoJ2EnLCB0YWdBdHRycykpO1xuICB0bXAudGV4dENvbnRlbnQgPSAnVmlldyBvbiBUdXJrb3B0aWNvbic7XG5cbiAgdGFnQXR0cnMgICAgICAgID0ge1xuICAgICdkYXRhLXJpZCcgICA6ICcnLFxuICAgICdkYXRhLXJuYW1lJyA6ICcnLFxuICAgICdkYXRhLXRpdGxlJyA6ICcnLFxuICAgICdkYXRhLXJld2FyZCc6ICcnLFxuICAgICdkYXRhLXBhdGgnICA6ICcvcmV2aWV3cy9uZXcnLFxuICAgIHRhcmdldCAgICAgICA6ICdfYmxhbmsnLFxuICB9O1xuICB0bXAgICAgICAgICAgICAgPSBsb2NrdXAuYXBwZW5kQ2hpbGQobWFrZSgnYScsIHRhZ0F0dHJzKSk7XG4gIHRtcC50ZXh0Q29udGVudCA9ICdBZGQgYSBuZXcgcmV2aWV3JztcblxuICByZXR1cm4gcm9vdDtcbn1cblxuZnVuY3Rpb24gYnVpbGRMaW5rKGVsLCBjYikge1xuICBjb25zdCBkcyAgID0gT2JqZWN0LmtleXMoZWwuZGF0YXNldCkuZmlsdGVyKGsgPT4gayAhPT0gJ3BhdGgnKSxcbiAgICAgICAgaHJlZiA9ICdodHRwczovL3R1cmtvcHRpY29uLmluZm8nICsgZWwuZGF0YXNldC5wYXRoO1xuXG4gIGRzLmZvckVhY2goayA9PiBlbC5kYXRhc2V0W2tdID0gY2IoaykpO1xuICBpZiAoZWwuZGF0YXNldC5wYXRoID09PSAnL3JlcXVlc3RlcnMnKVxuICAgIGVsLmhyZWYgPSBocmVmICsgJy8nICsgZHMubWFwKGsgPT4gZWwuZGF0YXNldFtrXSkuam9pbignLycpO1xuICBlbHNlXG4gICAgZWwuaHJlZiA9IGhyZWYgKyAnPycgKyBkcy5tYXAoayA9PiBgJHtrfT0ke2VsLmRhdGFzZXRba119YCkuam9pbignJicpO1xuXG4gIHJldHVybiBlbDtcbn1cbiIsImV4cG9ydCBjbGFzcyBBcGlRdWVyeSB7XG4gIGNvbnN0cnVjdG9yKGFjdGlvbiwgbWV0aG9kKSB7XG4gICAgdGhpcy5VUkkgICAgID0gJ2h0dHBzOi8vYXBpLnR1cmtvcHRpY29uLmluZm8vJyArIChhY3Rpb24gfHwgJycpO1xuICAgIHRoaXMubWV0aG9kICA9IG1ldGhvZCB8fCAnR0VUJztcbiAgICB0aGlzLnZlcnNpb24gPSAnMi4wLWFscGhhJztcbiAgfVxuXG4gIHNlbmQocGFyYW1zKSB7XG4gICAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgPyBuZXcgUGFyYW1zKHBhcmFtcykgOiBudWxsO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChhY2NlcHQsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgICAgICAgICB1cmwgPSB0aGlzLnBhcmFtcyA/IGAke3RoaXMuVVJJfT8ke3RoaXMucGFyYW1zLnRvU3RyaW5nKCl9YCA6IHRoaXMuVVJJO1xuICAgICAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHVybCk7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsIGBhcHBsaWNhdGlvbi92bmQudHVya29wdGljb24udiR7dGhpcy52ZXJzaW9ufStqc29uYCk7XG4gICAgICB4aHIuc2VuZCgpO1xuICAgICAgeGhyLm9ubG9hZCA9ICh7IHRhcmdldDp7IHJlc3BvbnNlIH0gfSkgPT4gYWNjZXB0KHJlc3BvbnNlKTtcbiAgICAgIHhoci5vbmVycm9yID0gZSA9PiByZWplY3QoZSk7XG4gICAgfSk7XG4gIH1cbn1cblxuY2xhc3MgUGFyYW1zIHtcbiAgY29uc3RydWN0b3IocGFyYW1zKSB7IHRoaXMucGFyYW1zID0gcGFyYW1zOyB9XG5cbiAgdG9TdHJpbmcoKSB7IHJldHVybiBQYXJhbXMudG9QYXJhbXModGhpcy5wYXJhbXMpOyB9XG5cbiAgc3RhdGljIHRvUGFyYW1zKG9iaiwgc2NvcGUpIHtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgIShvYmogaW5zdGFuY2VvZiBBcnJheSkpXG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoayA9PiBQYXJhbXMudG9QYXJhbXMob2JqW2tdLCBzY29wZSA/IGAke3Njb3BlfVske2t9XWAgOiBrKSkuam9pbignJicpO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBgJHtzY29wZX09JHtvYmoudG9TdHJpbmcoKX1gO1xuICB9XG59IiwiaW1wb3J0IHsgRXh0cmFjdG9yLCBBcGlRdWVyeSB9IGZyb20gJy4vc3JjL2luZGV4J1xuaW1wb3J0IHsgcXNhLCBtYWtlIH0gZnJvbSAnLi9zcmMvdXRpbHMvaW5kZXgnXG5cbnRyeSB7XG4gIGFwcGVuZENzcygpO1xuICBjb25zdCBleHRyID0gbmV3IEV4dHJhY3RvcigpLmluaXQoKS5jb2xsZWN0KHFzYSksXG4gICAgICAgIHJpZHMgPSBPYmplY3Qua2V5cyhleHRyLmNvbGxlY3Rpb24pO1xuXG4gIG5ldyBBcGlRdWVyeSgncmVxdWVzdGVycycpXG4gICAgLnNlbmQoeyByaWRzOiByaWRzLCBmaWVsZHM6IHsgcmVxdWVzdGVyczogWydyaWQnLCAnYWdncmVnYXRlcyddIH0gfSlcbiAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5kYXRhLnJlZHVjZSgoYSwgYikgPT4gKGFbYi5hdHRyaWJ1dGVzLnJpZF0gPSBiLmF0dHJpYnV0ZXMpICYmIGEsIHt9KSlcbiAgICAudGhlbihkYXRhID0+IHJpZHMuZm9yRWFjaChyaWQgPT4gZXh0ci5jb2xsZWN0aW9uW3JpZF0uZm9yRWFjaChjYXBzdWxlID0+IGNhcHN1bGUuaW5qZWN0KGRhdGFbcmlkXSkpKSlcbiAgICAuY2F0Y2goY29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUsICcjYXBpZXJyb3InKSk7XG59IGNhdGNoKGVycikge1xuICBjb25zb2xlLmVycm9yKGVycik7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENzcygpIHtcbiAgY29uc3Qgc3R5bGUgICAgID0gZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChtYWtlKCdzdHlsZScpKTtcbiAgc3R5bGUuaW5uZXJIVE1MID0gYFxuICAudG8tcmVsIHsgcG9zaXRpb246cmVsYXRpdmU7IH1cbiAgLnRvLWFicyB7IHBvc2l0aW9uOmFic29sdXRlOyB9XG4gIC50by1oZGkgeyBkaXNwbGF5OmlubGluZS1ibG9jazsgZm9udC1zaXplOjEycHg7IGN1cnNvcjpkZWZhdWx0OyBsaW5lLWhlaWdodDoxNHB4OyB9XG4gIC50by1oZGk6aG92ZXIgPiBzdmcgeyBmbG9hdDpsZWZ0OyB6LWluZGV4OjM7IHBvc2l0aW9uOnJlbGF0aXZlOyB9XG4gIC50by1oZGk6aG92ZXIgPiAudG8tbG9ja3VwIHsgZGlzcGxheTpibG9jazsgei1pbmRleDoyOyB9XG4gIC50by1oZGkgLmhpZGRlbiwgLnRvLW5oZGkgLmhpZGRlbiB7IGRpc3BsYXk6bm9uZSB9XG4gIC50by1uaGRpIHsgZm9udC1zaXplOjEycHg7IH1cbiAgLnRvLWxvY2t1cCB7IGRpc3BsYXk6bm9uZTsgd2lkdGg6MzAwcHg7IHRvcDotMXB4OyBsZWZ0Oi01cHg7IGJhY2tncm91bmQ6I2ZmZjsgcGFkZGluZzo1cHg7IGJveC1zaGFkb3c6MHB4IDJweCAxMHB4IDFweCByZ2JhKDAsMCwwLDAuNyk7IH1cbiAgLnRvLWxvY2t1cCBhIHsgZGlzcGxheTppbmxpbmUtYmxvY2s7IHdpZHRoOjUwJTsgdGV4dC1hbGlnbjpjZW50ZXI7IG1hcmdpbi10b3A6MTBweDsgY29sb3I6Y3JpbXNvbjsgfVxuICAudG8tcm4geyBtYXJnaW46MCAwIDNweCAyNXB4OyB3aGl0ZS1zcGFjZTpub3dyYXA7IG92ZXJmbG93OmhpZGRlbjsgdGV4dC1vdmVyZmxvdzplbGxpcHNpczsgfVxuICAudG8tZmMgeyBkaXNwbGF5OmZsZXg7IH1cbiAgLnRvLWZjID4gZGl2IHsgZmxleDoxOyB9XG4gIC50by1mYyAudG8tdGggeyBmb250LXdlaWdodDo3MDA7IHdpZHRoOjEwMCU7IGJhY2tncm91bmQ6IzZhOGNhMzsgY29sb3I6I2ZmZiB9XG4gIC50by1mYyBzcGFuIHsgZGlzcGxheTpibG9jazsgcGFkZGluZzozcHggMDsgbWFyZ2luOjA7IH1cbmA7XG59XG5cbiJdLCJuYW1lcyI6WyJxcyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsInFzYSIsIkFycmF5IiwiZnJvbSIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJtYWtlIiwidGFnIiwiYXR0cnMiLCJuYW1lc3BhY2UiLCJlbCIsImNyZWF0ZUVsZW1lbnROUyIsImNyZWF0ZUVsZW1lbnQiLCJrZXlzIiwiZm9yRWFjaCIsInNldEF0dHJpYnV0ZSIsImF0dHIiLCJmb3JtYXQiLCJyZXNwb25zZSIsInBheVJhdGUiLCJwYXkiLCJ0aW1lIiwidG90YWwiLCJ0b0ZpeGVkIiwidG9EYXlzIiwic2Vjb25kcyIsImlzTmFOIiwibGVuZ3RoIiwiSElUQ2Fwc3VsZSIsImxvY2t1cCIsImVsUmVmIiwiX2xvY2t1cCIsInNlbGVjdG9yIiwiY2xvc2VzdCIsImRhdGEiLCJpbmplY3QiLCJhdHRhY2giLCJlbnYiLCJyb290IiwibGVhZiIsIm1ldGhvZCIsIk9iamVjdCIsImFzc2lnbiIsInJlZHVjZSIsImEiLCJiIiwiX2dldCIsInRleHRDb250ZW50Iiwic2xpY2UiLCJocmVmIiwibWF0Y2giLCJ0cmltIiwidmFsdWUiLCJFeHRyYWN0b3IiLCJfc2VsZWN0b3IiLCJTZWxlY3RvciIsImdldEVudiIsIkxvY2t1cCIsImluaXQiLCJpc05leHQiLCJtb2RlbCIsIkpTT04iLCJwYXJzZSIsImFuY2hvciIsImRhdGFzZXQiLCJfZGF0YSIsInBydW5lUmVhY3RNb2RlbCIsImZuIiwiY29sbGVjdGlvbiIsIlR5cGVFcnJvciIsInNwbGl0IiwibWFwIiwiYyIsImkiLCJiYXNlIiwiZXh0cmFjdCIsInJpZCIsInB1c2giLCJzdHJhdCIsInBhdGgiLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwiZG9tYWluIiwiaW5jbHVkZXMiLCJ0ZXN0Iiwic3JjIiwiZCIsInJld2FyZCIsIm1vbmV0YXJ5X3Jld2FyZCIsImFtb3VudF9pbl9kb2xsYXJzIiwicmVxdWVzdGVyX2lkIiwidGl0bGUiLCJybmFtZSIsInJlcXVlc3Rlcl9uYW1lIiwic2VsZWN0b3JzIiwiaWRvbCIsImNyZWF0ZUxvY2t1cCIsInNjcmFwZURhdGEiLCJhZ2ciLCJhZ2dyZWdhdGVzIiwiY2xvbmUiLCJjbG9uZU5vZGUiLCJjYWxsIiwiY2hpbGRyZW4iLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJyYW5nZSIsInZhbCIsImNydWRlIiwiYnVpbGRMaW5rIiwiayIsImNvbnRleHQiLCJyZWYiLCJIVE1MTElFbGVtZW50IiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsInBvcyIsImNsYXNzIiwiZmxleCIsImFwcGVuZENoaWxkIiwibGFiZWxzIiwiaGVpZ2h0Iiwid2lkdGgiLCJ0bXAiLCJ0YWdBdHRycyIsInN0eWxlIiwiaW5uZXJIVE1MIiwidiIsImpvaW4iLCJsYWJlbCIsImlubmVyIiwiY2IiLCJkcyIsImZpbHRlciIsIkFwaVF1ZXJ5IiwiYWN0aW9uIiwiVVJJIiwidmVyc2lvbiIsInBhcmFtcyIsIlBhcmFtcyIsIlByb21pc2UiLCJhY2NlcHQiLCJyZWplY3QiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsInVybCIsInRvU3RyaW5nIiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJzZW5kIiwib25sb2FkIiwidGFyZ2V0Iiwib25lcnJvciIsImUiLCJ0b1BhcmFtcyIsIm9iaiIsInNjb3BlIiwiZXh0ciIsImNvbGxlY3QiLCJyaWRzIiwiZmllbGRzIiwicmVxdWVzdGVycyIsInRoZW4iLCJhdHRyaWJ1dGVzIiwiY2Fwc3VsZSIsImNhdGNoIiwiY29uc29sZSIsImVycm9yIiwiYmluZCIsImVyciIsImFwcGVuZENzcyIsImhlYWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLFNBQVNBLEVBQVQsR0FBcUI7U0FDbkIsQ0FBQyxzREFBV0MsUUFBWixFQUFzQkMsYUFBdEIsa0RBQVA7OztBQUdGLEFBQU8sU0FBU0MsR0FBVCxHQUFzQjtTQUNwQkMsTUFBTUMsSUFBTixDQUFXLENBQUMsc0RBQVdKLFFBQVosRUFBc0JLLGdCQUF0QixrREFBWCxDQUFQOzs7QUFHRixBQUFPLFNBQVNDLElBQVQsQ0FBY0MsR0FBZCxFQUEwQztNQUF2QkMsS0FBdUIsdUVBQWYsRUFBZTtNQUFYQyxTQUFXOztNQUN6Q0MsS0FBS0QsWUFBWVQs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
