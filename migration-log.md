# WordWiz — Migration Log

## Source
- `C:\Users\HP ELITEDESK 800 G3\Downloads\wordwiz.jsx` — single-file React component

## Target Structure
```
wordwiz/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── .gitignore
├── public/icons/icon-192.png   (placeholder)
├── public/icons/icon-512.png   (placeholder)
└── src/
    ├── main.jsx
    └── App.jsx
```

## Files to Create
| File | Purpose |
|------|---------|
| `index.html` | Vite entry HTML |
| `vite.config.js` | Vite + React + PWA plugin config |
| `package.json` | Dependencies + scripts |
| `src/main.jsx` | ReactDOM.createRoot entry point |
| `src/App.jsx` | wordwiz.jsx renamed, env var injected |
| `.env.example` | Documents required VITE_* vars |
| `.gitignore` | Excludes node_modules, dist, .env |
| `public/icons/*.png` | PWA icons (placeholder — replace before production) |

## Changes to wordwiz.jsx
1. Added `x-api-key: import.meta.env.VITE_ANTHROPIC_API_KEY` header to Anthropic fetch call
2. Added `anthropic-version: 2023-06-01` and `anthropic-dangerous-direct-browser-access: true` headers (required for direct browser calls)
3. Export remains `export default function WordWiz()`

## Env Vars
| Variable | Source |
|----------|--------|
| `VITE_ANTHROPIC_API_KEY` | Cloudflare Pages environment variable (set via dashboard or wrangler) |

## Security Note
`VITE_*` variables are embedded in the client-side JS bundle at build time and are visible to anyone who inspects the source. For production, consider a Cloudflare Worker proxy that holds the key server-side.

## Cloudflare Pages
- Project name: `wordwiz`
- Build command: `npm run build`
- Output dir: `dist`
