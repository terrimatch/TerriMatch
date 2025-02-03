{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "services": "/(.*)",
      "dest": "index.js"
    }
  ]
}
