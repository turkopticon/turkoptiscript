import { Extractor, ApiQuery } from './src/index'
import { qsa, make } from './src/utils/index'

try {
  appendCss();
  const extr = new Extractor().init().collect(qsa),
        rids = Object.keys(extr.collection);

  new ApiQuery('requesters')
    .send({ rids: rids, fields: { requesters: ['rid', 'aggregates'] } })
    .then(response => response.data.reduce((a, b) => (a[b.attributes.rid] = b.attributes) && a, {}))
    .then(data => rids.forEach(rid => extr.collection[rid].forEach(capsule => capsule.inject(data[rid]))))
    .catch(console.error.bind(console, '#apierror'));
} catch(err) {
  console.error(err);
}

function appendCss() {
  const style     = document.head.appendChild(make('style'));
  style.innerHTML = `
  .to-rel { position:relative; }
  .to-abs { position:absolute; }
  .to-hdi { display:inline-block; font-size:12px; cursor:default; line-height:14px; }
  .to-hdi:hover > svg { float:left; z-index:3; position:relative; }
  .to-hdi:hover > .to-lockup { display:block; z-index:2; }
  .to-hdi .hidden, .to-nhdi .hidden { display:none }
  .to-nhdi { font-size:12px; }
  .to-lockup { display:none; width:300px; top:-1px; left:-5px; background:#fff; padding:5px; box-shadow:0px 2px 10px 1px rgba(0,0,0,0.7); }
  .to-lockup a { display:inline-block; width:50%; text-align:center; margin-top:10px; color:crimson; }
  .to-rn { margin:0 0 3px 25px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .to-fc { display:flex; }
  .to-fc > div { flex:1; }
  .to-fc .to-th { font-weight:700; width:100%; background:#6a8ca3; color:#fff }
  .to-fc span { display:block; padding:3px 0; margin:0; }
`;
}

