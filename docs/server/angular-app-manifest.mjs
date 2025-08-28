
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://mohammedbayatena.github.io/Portfolio/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/Portfolio"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 721, hash: '5c35fbb8d349c1f5fd8fa68e6a9ac9213cacd80dff726a0c2f858fb4f73718dc', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1123, hash: 'c4e571cec5a9e7b0ab54a571051c0413ae45b646a2f5ce199a41a360591def6d', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 23777, hash: 'e27b02f089787e34462e201918c89a6e64bc1d8698c461ccf9aad7477d64d12f', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-ZZ3MOTG6.css': {size: 1002, hash: 'Q5uzkgaRXXo', text: () => import('./assets-chunks/styles-ZZ3MOTG6_css.mjs').then(m => m.default)}
  },
};
