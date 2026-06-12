# UtilityBelt

A collection of **47 developer tools** and **6 cheatsheets** — format, encode, convert, debug, visualize, and more. All client-side, no backend.

**Live:** https://ubelt.vercel.app

## 🤖 Fully Vibecoded with Hermes Agent

This project was built entirely through natural language conversations with [Hermes Agent](https://hermes-agent.nousresearch.com) — an autonomous AI coding assistant. From architecture to deployment, every line of code was generated, tested, and deployed via voice and chat prompts.

---

## Features

- **47 developer tools** in one place with quick search
- **6 cheatsheets** (Git, Docker, Markdown, SQL, TypeScript, React/Next.js)
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
| Slug Generator | Convert text to URL-friendly slugs |
| Text Analyzer | Word count, frequency, reading time |

### Convert
| Tool | Description |
|------|-------------|
| Color Converter | Convert between HEX, RGB, HSL |
| Contrast Checker | WCAG 2.1 contrast ratios (AA/AAA) |
| Epoch Converter | Convert between epoch & human-readable dates |
| Number Base | Convert between binary, octal, decimal, hex |
| CSV Parser | Parse, format & validate CSV data |
| YAML ↔ JSON | Bidirectional YAML / JSON conversion |
| HTML ↔ Markdown | Bidirectional HTML / Markdown conversion |
| JSON → TypeScript | Generate TypeScript interfaces from JSON |

### Network
| Tool | Description |
|------|-------------|
| cURL Converter | Convert cURL to fetch, axios, Python, Go |
| IP / Network Info | Public IP, browser info, screen details |
| Subnet Calculator | Compute network address, broadcast, hosts |

### Debug
| Tool | Description |
|------|-------------|
| Log Viewer | Parse, filter & inspect JSON log entries |
| JSONPath Tester | Query JSON data with JSONPath expressions |
| HTTP Status | Reference of all HTTP status codes |
| URL Parser | Parse and inspect URL components |
| Cron Builder | Build cron expressions with explanation |

### Visualization
| Tool | Description |
|------|-------------|
| SVG Filter Builder | Create SVG filter effects visually |
| CSS Gradient Generator | Build CSS gradients with live preview |
| Mermaid Playground | Create diagrams as code |
| Markdown Preview | Live markdown preview with split view |
| ASCII Art | Generate ASCII art from text |
| QR Code Generator | Generate QR codes from text or URLs |

### Specialty
| Tool | Description |
|------|-------------|
| Password Generator | Configurable password generator |
| Image to Base64 | Convert images to Base64 data URIs |
| Timer / Stopwatch | Stopwatch, countdown, and timer |

## Project Structure

```
utilitybelt/
├── src/
│   ├── __tests__/              # 178 unit & component tests
│   │   ├── types.test.ts       # Result<T> type helpers
│   │   ├── json.test.ts        # JSON format/minify/validate
│   │   ├── base64.test.ts      # Base64 encode/decode/unicode
│   │   ├── case.test.ts        # Case converter (7 formats)
│   │   ├── epoch.test.ts       # Epoch ↔ date
│   │   ├── csv.test.ts         # CSV ↔ JSON parser
│   │   ├── jwt.test.ts         # JWT decoder
│   │   ├── diff.test.ts        # LCS-based text diff
│   │   ├── remaining.test.ts   # URL, regex, SQL, HTML, slug, entities
│   │   ├── footer.test.tsx     # Footer component
│   │   ├── tool-layout.test.tsx# ToolLayout component
│   │   └── setup.ts            # Vitest setup + crypto polyfill
│   ├── app/
│   │   ├── page.tsx            # Landing page with category grid
│   │   ├── layout.tsx          # Root layout with navbar & footer
│   │   ├── tools/              # 47 tool pages
│   │   ├── blog/               # Blog pages
│   │   ├── cheatsheets/        # 6 cheatsheets
│   │   └── pricing/            # Pricing page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── navbar.tsx          # Sticky nav with mobile drawer
│   │   ├── footer.tsx          # Site footer
│   │   ├── theme-provider.tsx  # Dark/light theme context
│   │   ├── theme-toggle.tsx    # Theme toggle button
│   │   ├── command-palette.tsx # Cmd+K search
│   │   └── search-bar.tsx      # Search input component
│   └── lib/
│       ├── utils.ts            # Tailwind className utility
│       └── tools/              # Shared tool logic (30+ modules)
├── vitest.config.ts            # Test runner configuration
└── .gitignore                  # No secrets, no build artifacts
```

## Usage

```bash
git clone https://github.com/kvnlnk/utilitybelt.git
cd utilitybelt
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `Cmd+K` for the command palette.

## Tests

```bash
npm test             # Run all tests (single run)
npm run test:watch   # Watch mode for development
```

- **339 tests** across 13 suites
- **Unit tests** for all tool functions (pure function → Result<T> pattern)
- **Component tests** for Footer and ToolLayout
- **Vitest** + **@testing-library/react** + **jsdom**
- Tests found and fixed 2 production bugs on first run

## Deployment

```bash
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
| Testing | Vitest + Testing Library |
| Fonts | Geist (Vercel) |

## Development Principles

- **One file = one concern.** Every tool page is self-contained.
- **Client-side only.** No API calls, no backend, no data leaves the browser.
- **Pure functions.** Tool logic is separated from UI in `src/lib/tools/`.
- **Mobile-first.** Responsive from 375px to 4K.
- **Tested.** Every tool function has unit tests; bugs caught before deploy.
- **No secrets.** All `.env` files are gitignored. Zero server-side secrets.

## License

MIT
