"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReactCheatsheet() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/cheatsheets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Cheatsheets
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">React & Next.js Cheatsheet</h1>
        <p className="text-muted-foreground mt-1">
          Essential patterns for React 19 and Next.js App Router — components, hooks, data fetching, routing, and more.
        </p>
      </div>

      <div className="space-y-6">
        {/* Components */}
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">React components in 2025 — function components with TypeScript, props, and children.</p>
<pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">{`// Function component with TypeScript props
interface Props {
  title: string;
  children: React.ReactNode;
  onAction?: (id: string) => void;
}

export function Card({ title, children, onAction }: Props) {
  return (
    &lt;div className="rounded-lg border p-4"&gt;
      &lt;h2&gt;{title}&lt;/h2&gt;
      {children}
      {onAction && (
        &lt;button onClick={() => onAction("click")}&gt;Action&lt;/button&gt;
      )}
    &lt;/div&gt;
  );
}

// Default props via destructuring
export function Button({ variant = "primary", ...props }: ButtonProps) {
  return &lt;button className={variant} {...props} /&gt;;
}

// forwardRef + useImperativeHandle
export const Input = forwardRef&lt;HTMLInputElement, InputProps&gt;(
  (props, ref) => &lt;input ref={ref} {...props} /&gt;
);`}</pre>
          </CardContent>
        </Card>

        {/* Hooks */}
        <Card>
          <CardHeader>
            <CardTitle>Core Hooks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Most-used React hooks for state, side effects, and performance.</p>
<pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">{`// useState — local state
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);

// Functional update (when new state depends on old)
setCount(prev => prev + 1);

// useEffect — side effects
useEffect(() => {
  fetchData().then(setData);
  return () => cleanup(); // cleanup runs on unmount
}, [dependency]);

// useRef — mutable refs + DOM access
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();

// useMemo — memoize computed values
const sorted = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// useCallback — memoize functions
const handleClick = useCallback(
  (id: string) => setSelected(id),
  []
);`}</pre>
          </CardContent>
        </Card>

        {/* Custom Hooks */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Hooks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Encapsulate reusable logic in custom hooks (prefix with <code>use</code>).</p>
<pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">{`// Data fetching hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Local storage hook
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`}</pre>
          </CardContent>
        </Card>

        {/* Data Fetching */}
        <Card>
          <CardHeader>
            <CardTitle>Data Fetching (Next.js App Router)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Next.js App Router data fetching patterns — server components, client components, and revalidation.</p>
<pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">{`// Server Component — fetch directly (async component)
export default async function UserPage() {
  const user = await fetch(
    'https://api.example.com/user',
    { next: { revalidate: 3600 } } // ISR: revalidate every hour
  ).then(r => r.json());

  return &lt;div&gt;{user.name}&lt;/div&gt;;
}

// Route Handler (API route)
// app/api/users/route.ts
export async function GET(request: Request) {
  const users = await db.query.users.findAll();
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.insert.users(body).returning();
  return Response.json(user, { status: 201 });
}

// Server Actions (mutations)
// app/actions.ts
"use server";
export async function createUser(formData: FormData) {
  const name = formData.get("name");
  await db.insert.users({ name });
  revalidatePath("/users");
}

// Client-side fetch (useEffect or SWR/React Query)
"use client";
export function ClientList() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setData);
  }, []);
  return ...;
}`}</pre>
          </CardContent>
        </Card>

        {/* Routing */}
        <Card>
          <CardHeader>
            <CardTitle>App Router Patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Next.js App Router — file-based routing, layouts, loading states, and error boundaries.</p>
<pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">{`// File structure determines routes
// app/
//   page.tsx          → /
//   layout.tsx        → shared layout for /
//   loading.tsx       → loading UI
//   error.tsx         → error boundary
//   users/
//     page.tsx        → /users
//     [id]/
//       page.tsx      → /users/:id
//       not-found.tsx → 404 for this segment

// Dynamic route params
export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);
  return &lt;div&gt;{user.name}&lt;/div&gt;;
}

// Search params (URL query strings)
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  return &lt;div&gt;Search results for: {q}&lt;/div&gt;;
}

// useRouter for client-side navigation
"use client";
import { useRouter } from "next/navigation";
function Nav() {
  const router = useRouter();
  return (
    &lt;button onClick={() => router.push("/users")}&gt;
      Go to Users
    &lt;/button&gt;
  );
}`}</pre>
          </CardContent>
        </Card>

        {/* Server vs Client */}
        <Card>
          <CardHeader>
            <CardTitle>Server vs Client Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">When to use each, and how to interleave them.</p>
<pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">{`// Server Components (default in App Router)
// ✅ Direct database access, fetch, file system
// ✅ Smaller JS bundle
// ✅ SEO-friendly (full HTML)
// ❌ No state, effects, event handlers
// ❌ No browser APIs (localStorage, etc.)

export default async function Page() {
  const data = await db.query();
  return &lt;ServerComponent data={data} /&gt;;
}

// Client Components — add "use client"
// ✅ useState, useEffect, onClick, etc.
// ✅ Browser APIs
// ❌ Larger bundle
// ❌ Cannot use async directly

"use client";
export default function ClientPage() {
  const [count, setCount] = useState(0);
  return &lt;button onClick={() => setCount(c => c + 1)}&gt;
    {count}
  &lt;/button&gt;
}

// Composition — wrap client in server
// app/page.tsx (server)
import { ClientCounter } from "./client-counter";
export default function Page() {
  return (
    &lt;div&gt;
      &lt;h1&gt;This is server-rendered&lt;/h1&gt;
      &lt;ClientCounter /&gt; {/* Client component inside server */}
    &lt;/div&gt;
  );
}`}</pre>
          </CardContent>
        </Card>

        {/* React 19 Features */}
        <Card>
          <CardHeader>
            <CardTitle>React 19 & New Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">React 19 additions: actions, use(), useOptimistic, and form handling.</p>
<pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">{`// use() — read promises & context in render
"use client";
import { use } from "react";

function Comments({ promise }: { promise: Promise<Comment[]> }) {
  const comments = use(promise); // Suspends until resolved
  return comments.map(c => &lt;p key={c.id}&gt;{c.text}&lt;/p&gt;);
}

// useOptimistic — instant UI updates
"use client";
import { useOptimistic, useTransition } from "react";

function MessageForm() {
  const [messages, addOptimistic] = useOptimistic(
    initialMessages,
    (state, newMsg: string) => [...state, { text: newMsg, pending: true }]
  );
  const [, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const text = formData.get("message");
    startTransition(() => addOptimistic(text));
    await saveToServer(text);
  }

  return (
    &lt;form action={handleSubmit}&gt;
      &lt;input name="message" /&gt;
      &lt;button type="submit"&gt;Send&lt;/button&gt;
      {messages.map(m => (
        &lt;p className={m.pending ? "opacity-50" : ""}&gt;{m.text}&lt;/p&gt;
      ))}
    &lt;/form&gt;
  );
}

// useActionState — form state management
"use client";
import { useActionState } from "react";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (prev: { error: string | null }, formData: FormData) => {
      const res = await login(formData.get("email"));
      return { error: res.error };
    },
    { error: null }
  );

  return (
    &lt;form action={formAction}&gt;
      &lt;input name="email" type="email" /&gt;
      &lt;button disabled={isPending}&gt;
        {isPending ? "Logging in..." : "Login"}
      &lt;/button&gt;
      {state.error && &lt;p className="text-red-500"&gt;{state.error}&lt;/p&gt;}
    &lt;/form&gt;
  );
}`}</pre>
          </CardContent>
        </Card>

        {/* State Management */}
        <Card>
          <CardHeader>
            <CardTitle>State Management Patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">When to use useState vs Context vs Zustand vs React Query.</p>
<pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">{`// Context — for global/theme/user state
const ThemeContext = createContext<"light" | "dark">("light");
function App() {
  const [theme, setTheme] = useState("light");
  return (
    &lt;ThemeContext.Provider value={theme}&gt;
      &lt;ThemedComponent /&gt;
    &lt;/ThemeContext.Provider&gt;
  );
}
function ThemedComponent() {
  const theme = useContext(ThemeContext);
  return &lt;div className={theme}&gt;Content&lt;/div&gt;;
}

// Zustand (npm i zustand) — simple global state
import { create } from "zustand";
const useStore = create<{
  count: number;
  increment: () => void;
}>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
function Counter() {
  const { count, increment } = useStore();
  return &lt;button onClick={increment}&gt;{count}&lt;/button&gt;;
}

// React Query (TanStack Query) — server state
// npm i @tanstack/react-query
import { useQuery } from "@tanstack/react-query";
function Users() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(r => r.json()),
  });
  if (isLoading) return &lt;div&gt;Loading...&lt;/div&gt;;
  return data.map(u => &lt;p key={u.id}&gt;{u.name}&lt;/p&gt;);
}`}</pre>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Optimize renders with memo, useMemo, useCallback, and code splitting.</p>
<pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">{`// React.memo — prevent re-renders if props unchanged
const ExpensiveList = React.memo(function ExpensiveList({ items }: {
  items: Item[];
}) {
  return items.map(item => &lt;ItemComponent key={item.id} item={item} /&gt;;
});

// Dynamic imports — code splitting
import dynamic from "next/dynamic";
const HeavyComponent = dynamic(
  () => import("./heavy-component"),
  { loading: () => &lt;div&gt;Loading...&lt;/div&gt;, ssr: false }
);

// next/dynamic with named exports
const { Chart } = dynamic(
  () => import("./charts").then(mod => ({ default: mod.Chart })),
  { ssr: false }
);

// Image optimization (Next.js)
import Image from "next/image";
&lt;Image
  src="/hero.webp"
  alt="Hero"
  width={1200}
  height={630}
  priority // above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/webp;base64,..."
/&gt;

// Font optimization
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });`}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
