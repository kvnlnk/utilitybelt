# UtilityBelt

A collection of **47 developer tools** and **6 cheatsheets** for formatting, encoding, converting, debugging, and more.

**Live:** https://ubelt.vercel.app

## 🤖 Fully Vibecoded with Hermes Agent

This project was built entirely through natural language conversations with [Hermes Agent](https://hermes-agent.nousresearch.com) — an autonomous AI coding assistant. From architecture to deployment, every line of code was generated, tested, and deployed via voice and chat prompts.

---

## Features

- **38 developer tools** in one place with quick search
- **Dark/Light theme** toggle with persisted preference
- **Command palette** (`Cmd+K`) for instant tool switching
- **Responsive layout**: works on mobile (375px) and desktop
- **Static rendered**: fast loads, no server needed

## Tools

### Format
| Tool | Description |
|------|-------------|
| JSON | Pretty-print, minify & validate JSON |
| JSON Viewer | Collapsible tree view |
| SQL | Format and validate SQL queries |
| HTML | Format, minify & validate HTML |
| CSS | Format and beautify CSS |
| XML | Format and validate XML |

### Encode / Decode
| Tool | Description |
|------|-------------|
| Base64 | Encode & decode Base64 strings |
| URL | Encode & decode URL components |
| HTML Entities | Encode & decode HTML entities |

### Crypto
| Tool | Description |
|------|-------------|
| Hash | Generate SHA-1/256/384/512 hashes |
| UUID | Generate random UUID v4 identifiers |
| JWT | Decode and inspect JWT tokens |

### Text
| Tool | Description |
|------|-------------|
| Regex Tester | Test regular expressions with highlighting |
| Regex Explain | Break down regex into plain English |
| Diff Viewer | Compare two texts side-by-side |
| Case Converter | Convert between text cases |
| Lorem Ipsum | Generate placeholder text |

### Convert
| Tool | Description |
|------|-------------|
| Color Converter | Convert between HEX, RGB, HSL |
| Contrast Checker | WCAG 2.1 contrast ratios (AA/AAA) |
| Epoch Converter | Convert between epoch & human-readable dates |
| Number Base | Convert between binary, octal, decimal, hex |
| CSV Parser | Parse, format & validate CSV data |

### Network
| Tool | Description |
|------|-------------|
| cURL Converter | Convert cURL to fetch, axios, Python, Go |

### Debug
| Tool | Description |
|------|-------------|
| Log Viewer | Parse, filter & inspect JSON log entries |
| JSONPath Tester | Query JSON data with JSONPath expressions |
| HTTP Status | Reference of all HTTP status codes |
| IP / Network Info | Public IP, browser info, screen details |

### Visualization
| Tool | Description |
|------|-------------|
| SVG Filter Builder | Create SVG filter effects visually |
| CSS Gradient Generator | Build CSS gradients with live preview |
| Mermaid Playground | Create diagrams as code |
| Markdown Preview | Live markdown preview with split view |

### Specialty
| Tool | Description |
|------|-------------|
| Password Generator | Configurable password generator |
| Image to Base64 | Convert images to Base64 data URIs |
| ASCII Art | Generate ASCII art from text |
| Slug Generator | Convert text to URL-friendly slugs |
| QR Code Generator | Generate QR codes from text or URLs |
| Cron Builder | Build cron expressions with explanation |
| Timer / Stopwatch | Stopwatch, countdown, and timer |
| URL Parser | Parse and inspect URL components |

## Project Structure

```
devtools-hub/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page with category grid
│   │   ├── layout.tsx            # Root layout with navbar & footer
│   │   ├── tools/                # 38 tool pages
│   │   ├── blog/                 # Blog pages
│   │   ├── cheatsheets/          # Cheatsheets (git, docker, markdown)
│   │   └── pricing/              # Pricing page
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── navbar.tsx            # Sticky nav with mobile drawer
│   │   ├── footer.tsx            # Site footer
│   │   ├── theme-provider.tsx    # Dark/light theme context
│   │   ├── theme-toggle.tsx      # Theme toggle button
│   │   ├── command-palette.tsx   # Cmd+K search
│   │   └── search-bar.tsx        # Search input component
│   └── lib/
│       ├── utils.ts              # Tailwind className utility
│       └── tools/                # Shared tool logic (35 modules)
└── tailwind.config.ts
```

## Usage

1. **Clone and run:**
   ```bash
   git clone https://github.com/kvnlnk/devtools-hub.git
   cd devtools-hub
   npm install
   npm run dev
   ```

2. **Open** [http://localhost:3000](http://localhost:3000)

3. **Use `Cmd+K`** to open the command palette and search any tool

## Deployment

```bash
# Deploy to Vercel
npx vercel --prod
```

The app is fully static — no server needed. All tools run client-side.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Library | shadcn/ui (Radix-based) |
| Icons | lucide-react |
| Fonts | Geist (Vercel) |

## Development Principles

- **One file = one concern.** Every tool page is self-contained.
- **Client-side only.** No API calls, no backend, no data leaves the browser.
- **Pure functions.** Tool logic is separated from UI in `src/lib/tools/`.
- **Mobile-first.** Responsive from 375px to 4K.
- **No secrets.** All `.env` files are gitignored. Zero server-side secrets.

## License

MIT
