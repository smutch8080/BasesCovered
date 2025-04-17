import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for your frontend domain
app.use(cors({
  origin: process.env.VITE_APP_URL || 'http://localhost:5173',
  credentials: true
}));

// Proxy middleware configuration
const googleAuthProxy = createProxyMiddleware({
  target: 'https://accounts.google.com',
  changeOrigin: true,
  secure: true,
  onProxyRes: (proxyRes: any) => {
    // Remove CORS headers from Google's response
    delete proxyRes.headers['access-control-allow-origin'];
    delete proxyRes.headers['access-control-allow-credentials'];
  }
});

// Proxy routes for Google Auth
app.use('/oauth2', googleAuthProxy);
app.use('/o/oauth2', googleAuthProxy);

const PORT = process.env.PROXY_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Auth proxy server running on port ${PORT}`);
});

export default app; 