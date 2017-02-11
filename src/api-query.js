export class ApiQuery {
  constructor(action, method) {
    this.URI     = 'https://api.turkopticon.info/' + (action || '');
    this.method  = method || 'GET';
    this.version = '2.0-alpha';
  }

  send(params) {
    this.params = params ? new Params(params) : null;

    return new Promise((accept, reject) => {
      const xhr = new XMLHttpRequest(),
            url = this.params ? `${this.URI}?${this.params.toString()}` : this.URI;
      xhr.open(this.method, url);
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', `application/vnd.turkopticon.v${this.version}+json`);
      xhr.send();
      xhr.onload = ({ target:{ response } }) => accept(response);
      xhr.onerror = e => reject(e);
    });
  }
}

class Params {
  constructor(params) { this.params = params; }

  toString() { return Params.toParams(this.params); }

  static toParams(obj, scope) {
    if (typeof obj === 'object' && !(obj instanceof Array))
      return Object.keys(obj).map(k => Params.toParams(obj[k], scope ? `${scope}[${k}]` : k)).join('&');
    else
      return `${scope}=${obj.toString()}`;
  }
}