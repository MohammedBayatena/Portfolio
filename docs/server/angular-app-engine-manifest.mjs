
export default {
  basePath: 'https://mohammedbayatena.github.io/Portfolio',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
