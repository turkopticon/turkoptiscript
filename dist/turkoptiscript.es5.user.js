// ==UserScript==
// @name         turkoptiscript-es5
// @author       feihtality
// @namespace    https://greasyfork.org/en/users/12709
// @version      1.0.0-rc4
// @description  User script for Turkopticon -- review requesters on Amazon Mechanical Turk
// @license      ISC
// @include      https://*.mturk.com/*
// @exclude      https://www.mturk.com/mturk/findhits?*hit_scraper
// @grant        none
// ==/UserScript==
(function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function qs(selector, ctx) {
    return (ctx || document).querySelector(selector);
  }

  function qsa(selector, ctx) {
    return Array.from((ctx || document).querySelectorAll(selector));
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
      return t > 0 ? '$' + (p / t * Math.pow(60, 2)).toFixed(2) : '--';
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
        return payRate.apply(undefined, _toConsumableArray(data)) + '/hr';
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
      _classCallCheck(this, HITCapsule);

      this.elRef = el;
      this.attrs = {};
      this._lockup = lockup;
    }

    _createClass(HITCapsule, [{
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
          case 'name':
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
          case 'name':
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
      _classCallCheck(this, Extractor$$1);

      this._selector = new Selector();
    }

    _createClass(Extractor$$1, [{
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
        var _this2 = this;

        var collection = void 0;
        if (fn && typeof fn === 'function') collection = fn(this._selector.anchor);else throw new TypeError('expected a function');

        var keys = 'title name rid reward'.split(' ');
        this.collection = collection.map(function (c, i) {
          var data = _this2._data ? _this2._data[i] : null;
          return new HITCapsule(c, _this2._lockup).init(_this2._selector.base).extract(keys, _this2.env, data);
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
              name = src.requester_name;


          return { rid: rid, name: name, title: title, reward: reward };
        });
      }
    }]);

    return Extractor$$1;
  }();

  var Selector = function () {
    function Selector() {
      _classCallCheck(this, Selector);

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

    _createClass(Selector, [{
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
      _classCallCheck(this, Lockup);

      this.env = env;
      this.idol = createLockup(env);
    }

    _createClass(Lockup, [{
      key: 'inject',
      value: function inject(_ref, scrapeData) {
        var _this3 = this;

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

              qs(sel, _this3.clone).textContent = format(val, attr);
            });
          });
        }

        [].forEach.call(qsa('a', this.clone), function (el) {
          return buildLink(el, function (k) {
            return scrapeData[k];
          });
        });
        qs('.to-rn', this.clone).textContent = scrapeData.name;
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
      'data-name': '',
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
      return k + '=' + window.encodeURIComponent(el.dataset[k]);
    }).join('&');

    return el;
  }

  var ApiQuery = function () {
    function ApiQuery(action, method) {
      _classCallCheck(this, ApiQuery);

      this.URI = 'https://api.turkopticon.info/' + (action || '');
      this.method = method || 'GET';
      this.version = '2';
    }

    _createClass(ApiQuery, [{
      key: 'send',
      value: function send(params) {
        var _this4 = this;

        this.params = params ? new Params(params) : null;

        return new Promise(function (accept, reject) {
          var xhr = new XMLHttpRequest(),
              url = _this4.params ? _this4.URI + '?' + _this4.params.toString() : _this4.URI;
          xhr.open(_this4.method, url);
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/vnd.turkopticon.v' + _this4.version + '+json');
          xhr.send();
          xhr.onload = function (_ref2) {
            var response = _ref2.target.response;
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
      _classCallCheck(this, Params);

      this.params = params;
    }

    _createClass(Params, [{
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
  } catch (err) {
    console.error(err);
  }

  function appendCss() {
    var style = document.head.appendChild(make('style'));
    style.innerHTML = '\n  .to-rel { position:relative; }\n  .to-abs { position:absolute; }\n  .to-hdi { display:inline-block; font-size:12px; cursor:default; line-height:14px; }\n  .to-hdi:hover > svg { float:left; z-index:3; position:relative; }\n  .to-hdi:hover > .to-lockup { display:block; z-index:2; }\n  .to-hdi .hidden, .to-nhdi .hidden { display:none }\n  .to-nhdi { font-size:12px; }\n  .to-lockup { display:none; width:300px; top:-1px; left:-5px; background:#fff; padding:5px; box-shadow:0px 2px 10px 1px rgba(0,0,0,0.7); }\n  .to-lockup a { display:inline-block; width:50%; text-align:center; margin-top:10px; color:crimson; }\n  .to-rn { margin:0 0 3px 25px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n  .to-fc { display:flex; }\n  .to-fc > div { flex:1; }\n  .to-fc .to-th { font-weight:700; width:100%; background:#6a8ca3; color:#fff }\n  .to-fc span { display:block; padding:3px 0; margin:0; }\n';
  }
})();

