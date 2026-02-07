ironclad-jurist/
├── api/chat.js          ← Vercel serverless (calls Anthropic securely)
├── src/App.jsx          ← Full frontend (streaming, puppy, sidebar, everything)
├── src/main.jsx         ← React entry
├── index.html           ← HTML entry
├── package.json         ← Dependencies
├── vercel.json          ← Vercel routing + 60s timeout for long responses
├── vite.config.js       ← Build config
├── .gitignore           ← Ignores node_modules/dist
└── README.md            ← Instructions
