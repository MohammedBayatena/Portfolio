
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'Portfolio',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/Portfolio"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 685, hash: '0c1819e4bf9351b12904540a7e4a35ec1a9dd4bcc28c041c88b3d3feb7c2e674', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1087, hash: 'd4808642d7953bd4ee25d304e40dc27f319d73781a71c5afe3b8c261a6921047', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 24450, hash: '3c8ef8ebea11e6a4f026fb67c09265c7f90a1276400386cb4a25a5d1cfced77c', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-ZZ3MOTG6.css': {size: 1002, hash: 'Q5uzkgaRXXo', text: () => import('./assets-chunks/styles-ZZ3MOTG6_css.mjs').then(m => m.default)}
  },
};
