// Simple CORS proxy for local LLM APIs (Node.js/Express)
// Usage: node utils/cors-proxy.js
// Forwards requests to http://localhost:1234 (LM Studio) with CORS headers

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const target = 'http://localhost:1234';

app.use('/', createProxyMiddleware({
  target,
  changeOrigin: true,
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      });
      res.end();
    }
  },
  selfHandleResponse: false
}));

app.listen(8080, () => {
  console.log('CORS proxy running on http://localhost:8080 → http://localhost:1234');
});
