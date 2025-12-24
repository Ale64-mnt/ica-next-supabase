// pages/api/test.js - Test API
export default function handler(req, res) {
  res.status(200).json({ 
    working: true,
    type: 'pages-router-api',
    timestamp: new Date().toISOString(),
    message: 'Pages Router API works!',
    note: 'No more 0 byte problems!'
  });
}
