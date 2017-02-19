// ==UserScript==
// @name         turkoptiscript
// @author       feihtality
// @namespace    https://greasyfork.org/en/users/12709
// @version      1.0.0-rc1
// @description  User script for Turkopticon -- review requesters on Amazon Mechanical Turk
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

function format(data, attr) {
  var payRate = function payRate(p, t, total) {
    return t > 0 ? '$' + (p / t * 60 ** 2).toFixed(2) : '--';
  },
      toDays = function toDays(t) {
    return t > 0 ? (t / 86400.0).toFixed(2) : '--';
  },
      percent = function percent(x, n) {
    return n > 0 ? Math.round(100 * x / n) + '%' : '--';
  };

  switch (attr) {
    case 'pending':
      return toDays(data) + ' days';
    case 'reward':
      return payRate.apply(undefined, toConsumableArray(data)) + '/hr';
    case 'tos':
    case 'broken':
    case 'rejected':
      return data[0];
    default:
      return percent(data[0], data[1]) + ' of ' + data[1];
  }
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
                sel = '[data-range=' + range + '][data-attr=' + attr + ']';

            qs(sel, _this.clone).textContent = format(val, attr);
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

// should use custom elements which would be much cleaner, but waiting on FF/Edge to implement
function createLockup(env) {
  var pos = env.root === 'legacy' ? 'to-rel' : 'to-abs',
      root = make('div', { class: 'to-hdi ' + pos }),
      lockup = make('div', { class: 'to-lockup to-abs' }),
      flex = lockup.appendChild(make('div', { class: 'to-fc' })),
      labels = ['pay rate', 'time pending', 'response', 'recommend', 'rejected', 'tos', 'broken'],
      attrs = ['reward', 'pending', 'comm', 'recommend', 'rejected', 'tos', 'broken'];

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
    this.version = '2';
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIkM6L1VzZXJzL1l1YW5rYWkvUHJvamVjdHMvdHVya29wdGljb24vdHVya29wdGlzY3JpcHQvc3JjL3V0aWxzL2luZGV4LmpzIiwiQzovVXNlcnMvWXVhbmthaS9Qcm9qZWN0cy90dXJrb3B0aWNvbi90dXJrb3B0aXNjcmlwdC9zcmMvaGl0LWNhcHN1bGUuanMiLCJDOi9Vc2Vycy9ZdWFua2FpL1Byb2plY3RzL3R1cmtvcHRpY29uL3R1cmtvcHRpc2NyaXB0L3NyYy9leHRyYWN0b3IuanMiLCJDOi9Vc2Vycy9ZdWFua2FpL1Byb2plY3RzL3R1cmtvcHRpY29uL3R1cmtvcHRpc2NyaXB0L3NyYy9sb2NrdXAuanMiLCJDOi9Vc2Vycy9ZdWFua2FpL1Byb2plY3RzL3R1cmtvcHRpY29uL3R1cmtvcHRpc2NyaXB0L3NyYy9hcGktcXVlcnkuanMiLCJDOi9Vc2Vycy9ZdWFua2FpL1Byb2plY3RzL3R1cmtvcHRpY29uL3R1cmtvcHRpc2NyaXB0L2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBxcyguLi5hcmdzKSB7XG4gIHJldHVybiAoYXJnc1sxXSB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvcihhcmdzWzBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHFzYSguLi5hcmdzKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKChhcmdzWzFdIHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKGFyZ3NbMF0pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2UodGFnLCBhdHRycyA9IHt9LCBuYW1lc3BhY2UpIHtcbiAgY29uc3QgZWwgPSBuYW1lc3BhY2UgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCB0YWcpIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICBPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChhdHRyID0+IGVsLnNldEF0dHJpYnV0ZShhdHRyLCBhdHRyc1thdHRyXSkpO1xuICByZXR1cm4gZWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXQoZGF0YSwgYXR0cikge1xuICBjb25zdCBwYXlSYXRlID0gKHAsIHQsIHRvdGFsKSA9PiB0ID4gMCA/ICckJyArICgocC90KSo2MCoqMikudG9GaXhlZCgyKSA6ICctLScsXG4gICAgICAgIHRvRGF5cyAgPSAodCkgPT4gdCA+IDAgPyAodC84NjQwMC4wKS50b0ZpeGVkKDIpIDogJy0tJyxcbiAgICAgICAgcGVyY2VudCA9ICh4LG4pID0+IG4gPiAwID8gTWF0aC5yb3VuZCgxMDAqeC9uKSArICclJyA6ICctLSc7XG5cbiAgc3dpdGNoIChhdHRyKSB7XG4gICAgY2FzZSAncGVuZGluZyc6XG4gICAgICByZXR1cm4gYCR7dG9EYXlzKGRhdGEpfSBkYXlzYDtcbiAgICBjYXNlICdyZXdhcmQnOlxuICAgICAgcmV0dXJuIGAke3BheVJhdGUoLi4uZGF0YSl9L2hyYDtcbiAgICBjYXNlICd0b3MnOlxuICAgIGNhc2UgJ2Jyb2tlbic6XG4gICAgY2FzZSAncmVqZWN0ZWQnOlxuICAgICAgcmV0dXJuIGRhdGFbMF07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBgJHtwZXJjZW50KGRhdGFbMF0sZGF0YVsxXSl9IG9mICR7ZGF0YVsxXX1gXG4gIH1cbn0iLCJpbXBvcnQgeyBxcyB9IGZyb20gJy4vdXRpbHMvaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgSElUQ2Fwc3VsZSB7XG4gIGNvbnN0cnVjdG9yKGVsLCBsb2NrdXApIHtcbiAgICB0aGlzLmVsUmVmID0gZWw7XG4gICAgdGhpcy5hdHRycyAgID0ge307XG4gICAgdGhpcy5fbG9ja3VwID0gbG9ja3VwO1xuICB9XG5cbiAgaW5pdChzZWxlY3Rvcikge1xuICAgIGlmIChzZWxlY3RvcikgdGhpcy5lbFJlZiA9IHRoaXMuZWxSZWYuY2xvc2VzdChzZWxlY3Rvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpbmplY3QoZGF0YSkgeyB0aGlzLl9sb2NrdXAuaW5qZWN0KGRhdGEgfHwge30sIHRoaXMuYXR0cnMpLmF0dGFjaCh0aGlzLmVsUmVmKTsgfVxuXG4gIGV4dHJhY3QoYXR0cnMsIGVudiwgZGF0YSkge1xuICAgIGNvbnN0IHsgcm9vdCwgbGVhZiB9ID0gZW52LFxuICAgICAgICAgIG1ldGhvZCA9IGxlYWYgPT09ICdwcmV2aWV3JyA/ICdfZXh0cmFjdFByZXZpZXcnIDogJ19leHRyYWN0RGVmYXVsdCc7XG4gICAgaWYgKHJvb3QgPT09ICduZXh0JylcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5hdHRycywgYXR0cnMucmVkdWNlKChhLCBiKSA9PiAoYVtiXSA9IGRhdGFbYl0pICYmIGEsIHt9KSk7XG4gICAgZWxzZVxuICAgICAgYXR0cnMuZm9yRWFjaChhdHRyID0+IHRoaXMuYXR0cnNbYXR0cl0gPSB0aGlzW21ldGhvZF0oYXR0ciwgZW52KSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZXh0cmFjdERlZmF1bHQoYXR0ciwgZW52KSB7XG4gICAgaWYgKGVudi5sZWFmID09PSAnc3RhdHVzZGV0YWlsJyAmJiBhdHRyID09PSAndGl0bGUnKVxuICAgICAgcmV0dXJuIHRoaXMuX2dldCgnLnN0YXR1c2RldGFpbFRpdGxlQ29sdW1uVmFsdWUnKS50ZXh0Q29udGVudDtcblxuICAgIHN3aXRjaCAoYXR0cikge1xuICAgICAgY2FzZSAncmV3YXJkJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnc3Bhbi5yZXdhcmQnKS50ZXh0Q29udGVudC5zbGljZSgxKTtcbiAgICAgIGNhc2UgJ3JpZCc6XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ1tocmVmKj1cInJlcXVlc3RlcklkXCJdJykuaHJlZi5tYXRjaCgvcmVxdWVzdGVySWQ9KFtePSZdKykvKVsxXTtcbiAgICAgIGNhc2UgJ3JuYW1lJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnLnJlcXVlc3RlcklkZW50aXR5JykudGV4dENvbnRlbnQ7XG4gICAgICBjYXNlICd0aXRsZSc6XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2EuY2Fwc3VsZWxpbmsnKS50ZXh0Q29udGVudC50cmltKCk7XG4gICAgfVxuICB9XG5cbiAgX2V4dHJhY3RQcmV2aWV3KGF0dHIpIHtcbiAgICBzd2l0Y2ggKGF0dHIpIHtcbiAgICAgIGNhc2UgJ3Jld2FyZCc6XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ3NwYW4ucmV3YXJkJykudGV4dENvbnRlbnQuc2xpY2UoMSk7XG4gICAgICBjYXNlICdyaWQnOlxuICAgICAgICByZXR1cm4gcXMoJ2lucHV0W25hbWU9cmVxdWVzdGVySWRdJykudmFsdWU7XG4gICAgICBjYXNlICdybmFtZSc6XG4gICAgICAgIHJldHVybiBxcygnaW5wdXRbbmFtZT1wcmV2UmVxdWVzdGVyXScpLnZhbHVlO1xuICAgICAgY2FzZSAndGl0bGUnOlxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCcuY2Fwc3VsZWxpbmtfYm9sZCcpLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0KHNlbGVjdG9yKSB7IHJldHVybiBxcyhzZWxlY3RvciwgdGhpcy5lbFJlZik7IH1cbn0iLCJpbXBvcnQgeyBxcyB9IGZyb20gJy4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0IHsgSElUQ2Fwc3VsZSwgTG9ja3VwIH0gZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBFeHRyYWN0b3Ige1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zZWxlY3RvciA9IG5ldyBTZWxlY3RvcigpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLmVudiAgICAgPSBFeHRyYWN0b3IuZ2V0RW52KCk7XG4gICAgdGhpcy5fbG9ja3VwID0gbmV3IExvY2t1cCh0aGlzLmVudik7XG4gICAgdGhpcy5fc2VsZWN0b3IuaW5pdCh0aGlzLmVudik7XG5cbiAgICBjb25zdCBpc05leHQgPSB0aGlzLmVudi5yb290ID09PSAnbmV4dCcsXG4gICAgICAgICAgbW9kZWwgPSBpc05leHQgPyBKU09OLnBhcnNlKHFzKHRoaXMuX3NlbGVjdG9yLmFuY2hvcikuY2xvc2VzdCgnZGl2JykuZGF0YXNldFsncmVhY3RQcm9wcyddKSA6IG51bGw7XG4gICAgdGhpcy5fZGF0YSAgID0gbW9kZWwgPyBFeHRyYWN0b3IucHJ1bmVSZWFjdE1vZGVsKG1vZGVsLCB0aGlzLmVudikgOiBudWxsO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY29sbGVjdChmbikge1xuICAgIGxldCBjb2xsZWN0aW9uO1xuICAgIGlmIChmbiAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpXG4gICAgICBjb2xsZWN0aW9uID0gZm4odGhpcy5fc2VsZWN0b3IuYW5jaG9yKTtcbiAgICBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdGVkIGEgZnVuY3Rpb24nKTtcblxuICAgIGNvbnN0IGtleXMgICAgICA9ICd0aXRsZSBybmFtZSByaWQgcmV3YXJkJy5zcGxpdCgnICcpO1xuICAgIHRoaXMuY29sbGVjdGlvbiA9IGNvbGxlY3Rpb25cbiAgICAgIC5tYXAoKGMsIGkpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuX2RhdGEgPyB0aGlzLl9kYXRhW2ldIDogbnVsbDtcbiAgICAgICAgcmV0dXJuIG5ldyBISVRDYXBzdWxlKGMsIHRoaXMuX2xvY2t1cClcbiAgICAgICAgICAuaW5pdCh0aGlzLl9zZWxlY3Rvci5iYXNlKVxuICAgICAgICAgIC5leHRyYWN0KGtleXMsIHRoaXMuZW52LCBkYXRhKTtcbiAgICAgIH0pXG4gICAgICAucmVkdWNlKChhLCBiKSA9PiAoYVtiLmF0dHJzLnJpZF0gPyBhW2IuYXR0cnMucmlkXS5wdXNoKGIpIDogKGFbYi5hdHRycy5yaWRdID0gW2JdKSkgJiYgYSwge30pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3RhdGljIGdldEVudigpIHtcbiAgICBjb25zdCBzdHJhdCA9IHsgcm9vdDogJ2xlZ2FjeScsIGxlYWY6ICdkZWZhdWx0JyB9LFxuICAgICAgICAgIHBhdGggID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgaWYgKGRvY3VtZW50LmRvbWFpbi5pbmNsdWRlcygnd29ya2VyJykgfHwgcXMoJ2JvZHkgPiAuY29udGFpbmVyLWZsdWlkJykpXG4gICAgICBzdHJhdC5yb290ID0gJ25leHQnO1xuICAgIGlmIChwYXRoLmluY2x1ZGVzKCdzdGF0dXNkZXRhaWwnKSlcbiAgICAgIHN0cmF0LmxlYWYgPSAnc3RhdHVzZGV0YWlsJztcbiAgICBlbHNlIGlmICgvKG15aGl0c3x0YXNrcykvLnRlc3QocGF0aCkpXG4gICAgICBzdHJhdC5sZWFmID0gJ3F1ZXVlJztcbiAgICBlbHNlIGlmIChxcygnI3RoZVRpbWUnKSlcbiAgICAgIHN0cmF0LmxlYWYgPSAncHJldmlldyc7XG4gICAgcmV0dXJuIHN0cmF0O1xuICB9XG5cbiAgc3RhdGljIHBydW5lUmVhY3RNb2RlbChtb2RlbCwgZW52KSB7XG4gICAgcmV0dXJuIG1vZGVsWydib2R5RGF0YSddLm1hcChkID0+IHtcbiAgICAgIGNvbnN0IHNyYyA9IGVudi5sZWFmID09PSAncXVldWUnID8gZFsncHJvamVjdCddIDogZDtcblxuICAgICAgY29uc3QgeyBtb25ldGFyeV9yZXdhcmQ6IHsgYW1vdW50X2luX2RvbGxhcnM6cmV3YXJkIH0sIHJlcXVlc3Rlcl9pZDpyaWQsIHRpdGxlLCByZXF1ZXN0ZXJfbmFtZTpybmFtZSB9ID0gc3JjO1xuXG4gICAgICByZXR1cm4geyByaWQ6IHJpZCwgcm5hbWU6IHJuYW1lLCB0aXRsZTogdGl0bGUsIHJld2FyZDogcmV3YXJkIH07XG4gICAgfSk7XG4gIH1cblxufVxuXG5jbGFzcyBTZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VsZWN0b3JzID0ge1xuICAgICAgbmV4dCAgOiB7XG4gICAgICAgIGRlZmF1bHQ6IHsgYW5jaG9yOiAnbGkudGFibGUtcm93JywgYmFzZTogbnVsbCB9LFxuICAgICAgICBxdWV1ZSAgOiB7IGFuY2hvcjogJ2xpLnRhYmxlLXJvdycsIGJhc2U6IG51bGwgfVxuICAgICAgfSxcbiAgICAgIGxlZ2FjeToge1xuICAgICAgICBkZWZhdWx0ICAgICA6IHsgYW5jaG9yOiAnLnJlcXVlc3RlcklkZW50aXR5JywgYmFzZTogJ3RhYmxlW2hlaWdodF0nIH0sXG4gICAgICAgIHByZXZpZXcgICAgIDogeyBhbmNob3I6ICdhW2lkfD1cInJlcXVlc3Rlci50b29sdGlwXCJdJywgYmFzZTogJ3RhYmxlW3N0eWxlXScgfSxcbiAgICAgICAgcXVldWUgICAgICAgOiB7IGFuY2hvcjogJy5yZXF1ZXN0ZXJJZGVudGl0eScsIGJhc2U6ICd0YWJsZVtoZWlnaHRdJyB9LFxuICAgICAgICBzdGF0dXNkZXRhaWw6IHtcbiAgICAgICAgICBhbmNob3I6ICcuc3RhdHVzZGV0YWlsUmVxdWVzdGVyQ29sdW1uVmFsdWUnLFxuICAgICAgICAgIGJhc2UgIDogJ3RyJyxcbiAgICAgICAgICBpbmplY3Q6ICcuc3RhdHVzZGV0YWlsUmVxdWVzdGVyQ29sdW1uVmFsdWUnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaW5pdChlbnYpIHsgdGhpcy5lbnYgPSBlbnY7IH1cblxuICBnZXQgYW5jaG9yKCkge1xuICAgIGNvbnN0IHsgcm9vdCwgbGVhZiB9ID0gdGhpcy5lbnY7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0b3JzW3Jvb3RdW2xlYWZdLmFuY2hvcjtcbiAgfVxuXG4gIGdldCBiYXNlKCkge1xuICAgIGNvbnN0IHsgcm9vdCwgbGVhZiB9ID0gdGhpcy5lbnY7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0b3JzW3Jvb3RdW2xlYWZdLmJhc2U7XG4gIH1cblxuICBnZXQgaW5qZWN0KCkge1xuICAgIGNvbnN0IHsgcm9vdCwgbGVhZiB9ID0gdGhpcy5lbnY7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0b3JzW3Jvb3RdW2xlYWZdLmluamVjdCB8fCAnLmNhcHN1bGVfZmllbGRfdGV4dCc7XG4gIH1cbn0iLCJpbXBvcnQgeyBtYWtlLCBxcywgZm9ybWF0LCBxc2EgfSBmcm9tICcuL3V0aWxzL2luZGV4J1xuXG5leHBvcnQgY2xhc3MgTG9ja3VwIHtcbiAgY29uc3RydWN0b3IoZW52KSB7XG4gICAgdGhpcy5lbnYgID0gZW52O1xuICAgIHRoaXMuaWRvbCA9IGNyZWF0ZUxvY2t1cChlbnYpO1xuICB9XG5cbiAgaW5qZWN0KHsgYWdncmVnYXRlczphZ2cgfSwgc2NyYXBlRGF0YSkge1xuICAgIHRoaXMuY2xvbmUgICAgID0gdGhpcy5pZG9sLmNsb25lTm9kZSh0cnVlKTtcbiAgICBjb25zdCBzZWxlY3RvciA9ICcudG8tZmMnO1xuXG4gICAgaWYgKGFnZykge1xuICAgICAgW10uZm9yRWFjaC5jYWxsKHFzKHNlbGVjdG9yLCB0aGlzLmNsb25lKS5jaGlsZHJlbiwgZWwgPT4gZWwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJykpO1xuICAgICAgcXMoJ2EuaGlkZGVuJywgdGhpcy5jbG9uZSkuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XG4gICAgICBbJ2FsbCcsICdyZWNlbnQnXS5mb3JFYWNoKHJhbmdlID0+IHtcbiAgICAgICAgT2JqZWN0LmtleXMoYWdnW3JhbmdlXSkuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgICAgICBjb25zdCB2YWwgPSBhZ2dbcmFuZ2VdW2F0dHJdLFxuICAgICAgICAgICAgICAgIHNlbCA9IGBbZGF0YS1yYW5nZT0ke3JhbmdlfV1bZGF0YS1hdHRyPSR7YXR0cn1dYDtcblxuICAgICAgICAgIHFzKHNlbCwgdGhpcy5jbG9uZSkudGV4dENvbnRlbnQgPSBmb3JtYXQodmFsLCBhdHRyKVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIFtdLmZvckVhY2guY2FsbChxc2EoJ2EnLCB0aGlzLmNsb25lKSwgZWwgPT4gYnVpbGRMaW5rKGVsLCBrID0+IHNjcmFwZURhdGFba10pKTtcbiAgICBxcygnLnRvLXJuJywgdGhpcy5jbG9uZSkudGV4dENvbnRlbnQgPSBzY3JhcGVEYXRhLnJuYW1lO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYXR0YWNoKGNvbnRleHQpIHtcbiAgICBjb25zdCByZWYgPSBjb250ZXh0IGluc3RhbmNlb2YgSFRNTExJRWxlbWVudFxuICAgICAgPyBxcygnc3Bhbj5zcGFuJywgY29udGV4dClcbiAgICAgIDogKHFzKCcuY2Fwc3VsZV9maWVsZF90ZXh0JywgY29udGV4dCkgfHwgcXMoJ2EnLCBjb250ZXh0KSk7XG4gICAgcmVmLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMuY2xvbmUsIHJlZik7XG4gIH1cbn1cblxuLy8gc2hvdWxkIHVzZSBjdXN0b20gZWxlbWVudHMgd2hpY2ggd291bGQgYmUgbXVjaCBjbGVhbmVyLCBidXQgd2FpdGluZyBvbiBGRi9FZGdlIHRvIGltcGxlbWVudFxuZnVuY3Rpb24gY3JlYXRlTG9ja3VwKGVudikge1xuICBjb25zdFxuICAgIHBvcyAgICA9IGVudi5yb290ID09PSAnbGVnYWN5JyA/ICd0by1yZWwnIDogJ3RvLWFicycsXG4gICAgcm9vdCAgID0gbWFrZSgnZGl2JywgeyBjbGFzczogYHRvLWhkaSAke3Bvc31gIH0pLFxuICAgIGxvY2t1cCA9IG1ha2UoJ2RpdicsIHsgY2xhc3M6ICd0by1sb2NrdXAgdG8tYWJzJyB9KSxcbiAgICBmbGV4ICAgPSBsb2NrdXAuYXBwZW5kQ2hpbGQobWFrZSgnZGl2JywgeyBjbGFzczogJ3RvLWZjJyB9KSksXG4gICAgbGFiZWxzID0gWydwYXkgcmF0ZScsICd0aW1lIHBlbmRpbmcnLCAncmVzcG9uc2UnLCAncmVjb21tZW5kJywgJ3JlamVjdGVkJywgJ3RvcycsICdicm9rZW4nIF0sXG4gICAgYXR0cnMgID0gWydyZXdhcmQnLCAncGVuZGluZycsICdjb21tJywgJ3JlY29tbWVuZCcsICdyZWplY3RlZCcsICd0b3MnLCAnYnJva2VuJ107XG5cbiAgcm9vdC5hcHBlbmRDaGlsZChtYWtlKCdzdmcnLCB7IGhlaWdodDogMjAsIHdpZHRoOiAyMCB9LCAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnKSlcbiAgICAgIC5hcHBlbmRDaGlsZChtYWtlKCdwYXRoJywge1xuICAgICAgICBmaWxsOiAnIzY1N2I4MycsXG4gICAgICAgIGQgICA6ICdNMTAgMGMtNS41MiAwLTEwIDQuNDgtMTAgMTAgMCA1LjUyIDQuNDggMTAgMTAgMTAgNS41MiAwIDEwLTQuNDggMTAtMTAgMC01LjUyLTQuNDgtMTAtMTAtMTB6bTQuMjIgNS4zOGMxLjM0IDAgMi40MSAwLjQyIDMuMjIgMS4yNSAwLjgxIDAuODMgMS4yMiAyLjAyIDEuMjIgMy41IDAgMS40Ny0wLjM5IDIuNjEtMS4xOSAzLjQ0LTAuOCAwLjgzLTEuODggMS4yNS0zLjIyIDEuMjUtMS4zNiAwLTIuNDUtMC40Mi0zLjI1LTEuMjUtMC44LTAuODMtMS4xOS0xLjk1LTEuMTktMy40MSAwLTAuOTMgMC4xMy0xLjcxIDAuNDEtMi4zNCAwLjIxLTAuNDYgMC40OS0wLjg4IDAuODQtMS4yNSAwLjM2LTAuMzcgMC43Ni0wLjYzIDEuMTktMC44MSAwLjU3LTAuMjQgMS4yMy0wLjM3IDEuOTctMC4zN3ptLTEyLjQ3IDAuMTZoNy4yNXYxLjU2aC0yLjcydjcuNTZoLTEuODR2LTcuNTZoLTIuNjl2LTEuNTZ6bTEyLjUgMS40NGMtMC43NiAwLTEuMzggMC4yNi0xLjg0IDAuNzgtMC40NiAwLjUyLTAuNjkgMS4yOS0wLjY5IDIuMzQgMCAxLjAzIDAuMjEgMS44MSAwLjY5IDIuMzQgMC40OCAwLjUzIDEuMTEgMC44MSAxLjg0IDAuODEgMC43MyAwIDEuMzEtMC4yOCAxLjc4LTAuODEgMC40Ny0wLjUzIDAuNzItMS4zMiAwLjcyLTIuMzcgMC0xLjA1LTAuMjMtMS44My0wLjY5LTIuMzQtMC40Ni0wLjUxLTEuMDUtMC43NS0xLjgxLTAuNzV6J1xuICAgICAgfSwgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJykpO1xuICByb290LmFwcGVuZENoaWxkKGxvY2t1cCk7XG4gIGxvY2t1cC5pbnNlcnRCZWZvcmUobWFrZSgnZGl2JywgeyBjbGFzczogJ3RvLXJuJyB9KSwgZmxleCk7XG5cbiAgbGV0IHRtcCwgdGFnQXR0cnM7XG4gIHRtcCAgICAgICAgICAgPSBmbGV4LmFwcGVuZENoaWxkKG1ha2UoJ2RpdicsIHsgc3R5bGU6ICdtYXJnaW46MTBweCAwIDAnIH0pKTtcbiAgdG1wLmlubmVySFRNTCA9ICdUaGlzIHJlcXVlc3RlciBoYXMgbm90IGJlZW4gcmV2aWV3ZWQgeWV0Lic7XG5cbiAgdG1wICAgICAgICAgICA9IGZsZXguYXBwZW5kQ2hpbGQobWFrZSgnZGl2JywgeyBjbGFzczogJ2hpZGRlbicgfSkpO1xuICB0bXAuaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwidG8tdGhcIj4mbmJzcDs8L3NwYW4+JyArIGxhYmVscy5tYXAodiA9PiBgPHNwYW4+JHt2fTwvc3Bhbj5gKS5qb2luKCcnKTtcblxuICBbJ3JlY2VudCcsICdhbGwnXS5mb3JFYWNoKHJhbmdlID0+IHtcbiAgICB0bXAgICAgICAgICAgID0gZmxleC5hcHBlbmRDaGlsZChtYWtlKCdkaXYnLCB7IGNsYXNzOiAnaGlkZGVuJyB9KSk7XG4gICAgY29uc3QgbGFiZWwgICA9IGA8c3BhbiBjbGFzcz1cInRvLXRoXCI+JHtyYW5nZSA9PT0gJ2FsbCcgPyAnQWxsIHRpbWUnIDogJ0xhc3QgOTAgZGF5cyd9PC9zcGFuPmA7XG4gICAgbGV0IGlubmVyICAgICA9IGF0dHJzLm1hcCgoYXR0ciwgaSkgPT4gYDxzcGFuIGRhdGEtcmFuZ2U9XCIke3JhbmdlfVwiIGRhdGEtYXR0cj1cIiR7YXR0cn1cIj4tLS08L3NwYW4+YCk7XG4gICAgdG1wLmlubmVySFRNTCA9IGxhYmVsICsgaW5uZXIuam9pbignJyk7XG4gIH0pO1xuXG4gIHRhZ0F0dHJzICAgICAgICA9IHtcbiAgICBjbGFzcyAgICAgIDogJ2hpZGRlbicsXG4gICAgJ2RhdGEtcmlkJyA6ICcnLFxuICAgICdkYXRhLXBhdGgnOiAnL3JlcXVlc3RlcnMnLFxuICAgIHRhcmdldCAgICAgOiAnX2JsYW5rJyxcbiAgfTtcbiAgdG1wICAgICAgICAgICAgID0gbG9ja3VwLmFwcGVuZENoaWxkKG1ha2UoJ2EnLCB0YWdBdHRycykpO1xuICB0bXAudGV4dENvbnRlbnQgPSAnVmlldyBvbiBUdXJrb3B0aWNvbic7XG5cbiAgdGFnQXR0cnMgICAgICAgID0ge1xuICAgICdkYXRhLXJpZCcgICA6ICcnLFxuICAgICdkYXRhLXJuYW1lJyA6ICcnLFxuICAgICdkYXRhLXRpdGxlJyA6ICcnLFxuICAgICdkYXRhLXJld2FyZCc6ICcnLFxuICAgICdkYXRhLXBhdGgnICA6ICcvcmV2aWV3cy9uZXcnLFxuICAgIHRhcmdldCAgICAgICA6ICdfYmxhbmsnLFxuICB9O1xuICB0bXAgICAgICAgICAgICAgPSBsb2NrdXAuYXBwZW5kQ2hpbGQobWFrZSgnYScsIHRhZ0F0dHJzKSk7XG4gIHRtcC50ZXh0Q29udGVudCA9ICdBZGQgYSBuZXcgcmV2aWV3JztcblxuICByZXR1cm4gcm9vdDtcbn1cblxuZnVuY3Rpb24gYnVpbGRMaW5rKGVsLCBjYikge1xuICBjb25zdCBkcyAgID0gT2JqZWN0LmtleXMoZWwuZGF0YXNldCkuZmlsdGVyKGsgPT4gayAhPT0gJ3BhdGgnKSxcbiAgICAgICAgaHJlZiA9ICdodHRwczovL3R1cmtvcHRpY29uLmluZm8nICsgZWwuZGF0YXNldC5wYXRoO1xuXG4gIGRzLmZvckVhY2goayA9PiBlbC5kYXRhc2V0W2tdID0gY2IoaykpO1xuICBpZiAoZWwuZGF0YXNldC5wYXRoID09PSAnL3JlcXVlc3RlcnMnKVxuICAgIGVsLmhyZWYgPSBocmVmICsgJy8nICsgZHMubWFwKGsgPT4gZWwuZGF0YXNldFtrXSkuam9pbignLycpO1xuICBlbHNlXG4gICAgZWwuaHJlZiA9IGhyZWYgKyAnPycgKyBkcy5tYXAoayA9PiBgJHtrfT0ke2VsLmRhdGFzZXRba119YCkuam9pbignJicpO1xuXG4gIHJldHVybiBlbDtcbn1cbiIsImV4cG9ydCBjbGFzcyBBcGlRdWVyeSB7XG4gIGNvbnN0cnVjdG9yKGFjdGlvbiwgbWV0aG9kKSB7XG4gICAgdGhpcy5VUkkgICAgID0gJ2h0dHBzOi8vYXBpLnR1cmtvcHRpY29uLmluZm8vJyArIChhY3Rpb24gfHwgJycpO1xuICAgIHRoaXMubWV0aG9kICA9IG1ldGhvZCB8fCAnR0VUJztcbiAgICB0aGlzLnZlcnNpb24gPSAnMic7XG4gIH1cblxuICBzZW5kKHBhcmFtcykge1xuICAgIHRoaXMucGFyYW1zID0gcGFyYW1zID8gbmV3IFBhcmFtcyhwYXJhbXMpIDogbnVsbDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgoYWNjZXB0LCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLFxuICAgICAgICAgICAgdXJsID0gdGhpcy5wYXJhbXMgPyBgJHt0aGlzLlVSSX0/JHt0aGlzLnBhcmFtcy50b1N0cmluZygpfWAgOiB0aGlzLlVSSTtcbiAgICAgIHhoci5vcGVuKHRoaXMubWV0aG9kLCB1cmwpO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCBgYXBwbGljYXRpb24vdm5kLnR1cmtvcHRpY29uLnYke3RoaXMudmVyc2lvbn0ranNvbmApO1xuICAgICAgeGhyLnNlbmQoKTtcbiAgICAgIHhoci5vbmxvYWQgPSAoeyB0YXJnZXQ6eyByZXNwb25zZSB9IH0pID0+IGFjY2VwdChyZXNwb25zZSk7XG4gICAgICB4aHIub25lcnJvciA9IGUgPT4gcmVqZWN0KGUpO1xuICAgIH0pO1xuICB9XG59XG5cbmNsYXNzIFBhcmFtcyB7XG4gIGNvbnN0cnVjdG9yKHBhcmFtcykgeyB0aGlzLnBhcmFtcyA9IHBhcmFtczsgfVxuXG4gIHRvU3RyaW5nKCkgeyByZXR1cm4gUGFyYW1zLnRvUGFyYW1zKHRoaXMucGFyYW1zKTsgfVxuXG4gIHN0YXRpYyB0b1BhcmFtcyhvYmosIHNjb3BlKSB7XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmICEob2JqIGluc3RhbmNlb2YgQXJyYXkpKVxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGsgPT4gUGFyYW1zLnRvUGFyYW1zKG9ialtrXSwgc2NvcGUgPyBgJHtzY29wZX1bJHtrfV1gIDogaykpLmpvaW4oJyYnKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gYCR7c2NvcGV9PSR7b2JqLnRvU3RyaW5nKCl9YDtcbiAgfVxufSIsImltcG9ydCB7IEV4dHJhY3RvciwgQXBpUXVlcnkgfSBmcm9tICcuL3NyYy9pbmRleCdcbmltcG9ydCB7IHFzYSwgbWFrZSB9IGZyb20gJy4vc3JjL3V0aWxzL2luZGV4J1xuXG50cnkge1xuICBhcHBlbmRDc3MoKTtcbiAgY29uc3QgZXh0ciA9IG5ldyBFeHRyYWN0b3IoKS5pbml0KCkuY29sbGVjdChxc2EpLFxuICAgICAgICByaWRzID0gT2JqZWN0LmtleXMoZXh0ci5jb2xsZWN0aW9uKTtcblxuICBuZXcgQXBpUXVlcnkoJ3JlcXVlc3RlcnMnKVxuICAgIC5zZW5kKHsgcmlkczogcmlkcywgZmllbGRzOiB7IHJlcXVlc3RlcnM6IFsncmlkJywgJ2FnZ3JlZ2F0ZXMnXSB9IH0pXG4gICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuZGF0YS5yZWR1Y2UoKGEsIGIpID0+IChhW2IuYXR0cmlidXRlcy5yaWRdID0gYi5hdHRyaWJ1dGVzKSAmJiBhLCB7fSkpXG4gICAgLnRoZW4oZGF0YSA9PiByaWRzLmZvckVhY2gocmlkID0+IGV4dHIuY29sbGVjdGlvbltyaWRdLmZvckVhY2goY2Fwc3VsZSA9PiBjYXBzdWxlLmluamVjdChkYXRhW3JpZF0pKSkpXG4gICAgLmNhdGNoKGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlLCAnI2FwaWVycm9yJykpO1xufSBjYXRjaChlcnIpIHtcbiAgY29uc29sZS5lcnJvcihlcnIpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDc3MoKSB7XG4gIGNvbnN0IHN0eWxlICAgICA9IGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobWFrZSgnc3R5bGUnKSk7XG4gIHN0eWxlLmlubmVySFRNTCA9IGBcbiAgLnRvLXJlbCB7IHBvc2l0aW9uOnJlbGF0aXZlOyB9XG4gIC50by1hYnMgeyBwb3NpdGlvbjphYnNvbHV0ZTsgfVxuICAudG8taGRpIHsgZGlzcGxheTppbmxpbmUtYmxvY2s7IGZvbnQtc2l6ZToxMnB4OyBjdXJzb3I6ZGVmYXVsdDsgbGluZS1oZWlnaHQ6MTRweDsgfVxuICAudG8taGRpOmhvdmVyID4gc3ZnIHsgZmxvYXQ6bGVmdDsgei1pbmRleDozOyBwb3NpdGlvbjpyZWxhdGl2ZTsgfVxuICAudG8taGRpOmhvdmVyID4gLnRvLWxvY2t1cCB7IGRpc3BsYXk6YmxvY2s7IHotaW5kZXg6MjsgfVxuICAudG8taGRpIC5oaWRkZW4sIC50by1uaGRpIC5oaWRkZW4geyBkaXNwbGF5Om5vbmUgfVxuICAudG8tbmhkaSB7IGZvbnQtc2l6ZToxMnB4OyB9XG4gIC50by1sb2NrdXAgeyBkaXNwbGF5Om5vbmU7IHdpZHRoOjMwMHB4OyB0b3A6LTFweDsgbGVmdDotNXB4OyBiYWNrZ3JvdW5kOiNmZmY7IHBhZGRpbmc6NXB4OyBib3gtc2hhZG93OjBweCAycHggMTBweCAxcHggcmdiYSgwLDAsMCwwLjcpOyB9XG4gIC50by1sb2NrdXAgYSB7IGRpc3BsYXk6aW5saW5lLWJsb2NrOyB3aWR0aDo1MCU7IHRleHQtYWxpZ246Y2VudGVyOyBtYXJnaW4tdG9wOjEwcHg7IGNvbG9yOmNyaW1zb247IH1cbiAgLnRvLXJuIHsgbWFyZ2luOjAgMCAzcHggMjVweDsgd2hpdGUtc3BhY2U6bm93cmFwOyBvdmVyZmxvdzpoaWRkZW47IHRleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7IH1cbiAgLnRvLWZjIHsgZGlzcGxheTpmbGV4OyB9XG4gIC50by1mYyA+IGRpdiB7IGZsZXg6MTsgfVxuICAudG8tZmMgLnRvLXRoIHsgZm9udC13ZWlnaHQ6NzAwOyB3aWR0aDoxMDAlOyBiYWNrZ3JvdW5kOiM2YThjYTM7IGNvbG9yOiNmZmYgfVxuICAudG8tZmMgc3BhbiB7IGRpc3BsYXk6YmxvY2s7IHBhZGRpbmc6M3B4IDA7IG1hcmdpbjowOyB9XG5gO1xufVxuXG4iXSwibmFtZXMiOlsicXMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxc2EiLCJBcnJheSIsImZyb20iLCJxdWVyeVNlbGVjdG9yQWxsIiwibWFrZSIsInRhZyIsImF0dHJzIiwibmFtZXNwYWNlIiwiZWwiLCJjcmVhdGVFbGVtZW50TlMiLCJjcmVhdGVFbGVtZW50Iiwia2V5cyIsImZvckVhY2giLCJzZXRBdHRyaWJ1dGUiLCJhdHRyIiwiZm9ybWF0IiwiZGF0YSIsInBheVJhdGUiLCJwIiwidCIsInRvdGFsIiwidG9GaXhlZCIsInRvRGF5cyIsInBlcmNlbnQiLCJ4IiwibiIsIk1hdGgiLCJyb3VuZCIsIkhJVENhcHN1bGUiLCJsb2NrdXAiLCJlbFJlZiIsIl9sb2NrdXAiLCJzZWxlY3RvciIsImNsb3Nlc3QiLCJpbmplY3QiLCJhdHRhY2giLCJlbnYiLCJyb290IiwibGVhZiIsIm1ldGhvZCIsIk9iamVjdCIsImFzc2lnbiIsInJlZHVjZSIsImEiLCJiIiwiX2dldCIsInRleHRDb250ZW50Iiwic2xpY2UiLCJocmVmIiwibWF0Y2giLCJ0cmltIiwidmFsdWUiLCJFeHRyYWN0b3IiLCJfc2VsZWN0b3IiLCJTZWxlY3RvciIsImdldEVudiIsIkxvY2t1cCIsImluaXQiLCJpc05leHQiLCJtb2RlbCIsIkpTT04iLCJwYXJzZSIsImFuY2hvciIsImRhdGFzZXQiLCJfZGF0YSIsInBydW5lUmVhY3RNb2RlbCIsImZuIiwiY29sbGVjdGlvbiIsIlR5cGVFcnJvciIsInNwbGl0IiwibWFwIiwiYyIsImkiLCJiYXNlIiwiZXh0cmFjdCIsInJpZCIsInB1c2giLCJzdHJhdCIsInBhdGgiLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwiZG9tYWluIiwiaW5jbHVkZXMiLCJ0ZXN0Iiwic3JjIiwiZCIsInJld2FyZCIsIm1vbmV0YXJ5X3Jld2FyZCIsImFtb3VudF9pbl9kb2xsYXJzIiwicmVxdWVzdGVyX2lkIiwidGl0bGUiLCJybmFtZSIsInJlcXVlc3Rlcl9uYW1lIiwic2VsZWN0b3JzIiwiaWRvbCIsImNyZWF0ZUxvY2t1cCIsInNjcmFwZURhdGEiLCJhZ2ciLCJhZ2dyZWdhdGVzIiwiY2xvbmUiLCJjbG9uZU5vZGUiLCJjYWxsIiwiY2hpbGRyZW4iLCJjbGFzc0xpc3QiLCJ0b2dnbGUiLCJyYW5nZSIsInZhbCIsInNlbCIsImJ1aWxkTGluayIsImsiLCJjb250ZXh0IiwicmVmIiwiSFRNTExJRWxlbWVudCIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJwb3MiLCJjbGFzcyIsImZsZXgiLCJhcHBlbmRDaGlsZCIsImxhYmVscyIsImhlaWdodCIsIndpZHRoIiwidG1wIiwidGFnQXR0cnMiLCJzdHlsZSIsImlubmVySFRNTCIsInYiLCJqb2luIiwibGFiZWwiLCJpbm5lciIsImNiIiwiZHMiLCJmaWx0ZXIiLCJBcGlRdWVyeSIsImFjdGlvbiIsIlVSSSIsInZlcnNpb24iLCJwYXJhbXMiLCJQYXJhbXMiLCJQcm9taXNlIiwiYWNjZXB0IiwicmVqZWN0IiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJ1cmwiLCJ0b1N0cmluZyIsIm9wZW4iLCJyZXNwb25zZVR5cGUiLCJzZXRSZXF1ZXN0SGVhZGVyIiwic2VuZCIsIm9ubG9hZCIsInJlc3BvbnNlIiwidGFyZ2V0Iiwib25lcnJvciIsImUiLCJ0b1BhcmFtcyIsIm9iaiIsInNjb3BlIiwiZXh0ciIsImNvbGxlY3QiLCJyaWRzIiwiZmllbGRzIiwicmVxdWVzdGVycyIsInRoZW4iLCJhdHRyaWJ1dGVzIiwiY2Fwc3VsZSIsImNhdGNoIiwiY29uc29sZSIsImVycm9yIiwiYmluZCIsImVyciIsImFwcGVuZENzcyIsImhlYWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLFNB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
