/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 * 皖信：http://47.114.142.133:9999/
 * 科恩：http://36.7.147.30:9999/
 * 测试：http://36.7.147.29:9999/
 */
// 皖信
// const url = 'http://prd-hro-yifu-gateway.worfu.com/';
// 科恩
// const url = 'http://36.7.147.30:9999/';
// 测试
const url = 'https://qas-mvp-b.worfu.com'; // b测试环境地址
// const url = 'http://172.16.24.66:8888/'; // 房本地
// const url = 'http://172.16.24.77:8888/'; // 胡本地
// const url = 'http://172.16.24.250:8888/'; // 洪光武本地/

export default {
  dev: {
    '/api/': {
      target: url,
      changeOrigin: true,
      pathRewrite: {
        // '^/api/': '',
      },
    },
  },
  test: {
    '/api/': {
      target: url,
      changeOrigin: true,
      pathRewrite: {
        // '^': '',
      },
    },
  },
  pre: {
    '/api/': {
      target: url,
      changeOrigin: true,
      pathRewrite: {
        // '^/api/': '',
      },
    },
  },
  proxy: {
    '/api/': {
      target: url,
      changeOrigin: true,
      pathRewrite: {
        // '^/api/': '',
      },
    },
  },
};
