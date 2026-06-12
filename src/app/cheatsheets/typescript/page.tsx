"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Basic Types",
    code: `// String
let name: string = "TypeScript";

// Number
let age: number = 42;
let hex: number = 0xff;
let binary: number = 0b1010;

// Boolean
let isDone: boolean = false;

// Array
let items: number[] = [1, 2, 3];
let names: Array<string> = ["a", "b"];

// Tuple
let pair: [string, number] = ["hello", 42];

// Enum
enum Color { Red, Green, Blue }
let c: Color = Color.Green;

// Special types
let anyVal: any = "anything";     // opt-out of checking
let unknownVal: unknown = 42;     // safe any — must narrow
function fail(): never {          // never returns
  throw new Error("always throws");
}
function log(): void {            // returns undefined
  console.log("no return value");
}`,
  },
  {
    title: "Interfaces & Types",
    code: `// Interface — declaration merging, extends
interface User {
  name: string;
  email: string;
}
interface Admin extends User {
  role: "admin";
}

// Type alias — unions, intersections, mapped types
type Point = { x: number; y: number };
type NamedPoint = Point & { name: string }; // intersection

// Union & Intersection
type Status = "idle" | "loading" | "error";
type Result = { success: true; data: unknown }
             | { success: false; error: string };

// Utility type operators
type UserName = Pick<User, "name">;
type WithoutEmail = Omit<User, "email">;
type PartialUser = Partial<User>;
type RequiredUser = Required<PartialUser>;
type ReadonlyUser = Readonly<User>;`,
  },
  {
    title: "Functions",
    code: `// Parameter & return types
function add(a: number, b: number): number {
  return a + b;
}

// Optional & default parameters
function greet(name: string, greeting?: string): string {
  return greeting ?? "Hello";
}
function multiply(a: number, b: number = 1): number {
  return a * b;
}

// Overloads — multiple call signatures
function process(input: string): string[];
function process(input: number): number;
function process(input: string | number): unknown {
  if (typeof input === "string") return input.split("");
  return input;
}

// Generic function
function identity<T>(arg: T): T {
  return arg;
}
identity<string>("hello"); // explicit
identity(42);              // inferred`,
  },
  {
    title: "Generics",
    code: `// Generic function with constraint
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}
getLength("hello"); // 5
getLength([1, 2]);   // 2

// Generic interface
interface Repository<T> {
  get(id: string): T;
  save(item: T): void;
}

// Conditional type
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<"hello">;  // "yes"
type B = IsString<number>;    // "no"

// Practical conditional type
type ArrayElement<T> = T extends (infer U)[] ? U : never;
type El = ArrayElement<string[]>; // string

// Distributive conditional types
type ToArray<T> = T extends unknown ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]`,
  },
  {
    title: "Utility Types",
    code: `interface Todo {
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

// Partial — all fields optional
const update: Partial<Todo> = { completed: true };

// Required — all fields mandatory
type StrictTodo = Required<Partial<Todo>>;

// Pick — select specific keys
type TodoPreview = Pick<Todo, "title" | "completed">;

// Omit — remove keys
type TodoWithoutDate = Omit<Todo, "createdAt">;

// Record — key-value map
type PageInfo = Record<string, { title: string; url: string }>;

// Extract / Exclude — union filtering
type T0 = Extract<"a" | "b" | "c", "a" | "f">; // "a"
type T1 = Exclude<"a" | "b" | "c", "a" | "b">; // "c"

// NonNullable — remove null/undefined
type T2 = NonNullable<string | number | null | undefined>; // string | number

// ReturnType / Parameters — function introspection
function greetUser(name: string, age: number): string {
  return \`\${name} is \${age}\`;
}
type GreetReturn = ReturnType<typeof greetUser>;   // string
type GreetParams = Parameters<typeof greetUser>;    // [string, number]

// Awaited — unwrap promises
type ResultType = Awaited<Promise<string>>; // string`,
  },
  {
    title: "Mapped Types",
    code: `// Basic mapped type — make all properties readonly
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Make all properties optional
type Partial<T> = {
  [K in keyof T]?: T[K];
};

// Key remapping via 'as' clause (TS 4.1+)
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
interface Person { name: string; age: number; }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }

// Filter keys with 'as'
type StringKeys<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// Template literal types
type EventName = \`on\${Capitalize<string>}\`;
// "onClick" | "onChange" | "onSubmit" ...

// Practical mapped type
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};`,
  },
  {
    title: "Type Guards",
    code: `// typeof — primitive narrowing
function printValue(val: string | number) {
  if (typeof val === "string") {
    console.log(val.toUpperCase()); // string
  } else {
    console.log(val.toFixed(2));    // number
  }
}

// instanceof — class narrowing
class Dog { bark() {} }
class Cat { meow() {} }
function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) animal.bark();
  else animal.meow();
}

// 'in' — property existence check
type Fish = { swim: () => void };
type Bird = { fly: () => void };
function move(pet: Fish | Bird) {
  if ("swim" in pet) pet.swim();
  else pet.fly();
}

// Custom type predicate (is)
interface Square { kind: "square"; size: number; }
interface Circle { kind: "circle"; radius: number; }
type Shape = Square | Circle;

function isSquare(shape: Shape): shape is Square {
  return shape.kind === "square";
}

// Discriminated union — ideal pattern
function area(shape: Shape): number {
  switch (shape.kind) {
    case "square": return shape.size ** 2;
    case "circle": return Math.PI * shape.radius ** 2;
  }
}`,
  },
  {
    title: "Advanced",
    code: `// satisfies — validate shape without widening (TS 4.9+)
type Color = string | { r: number; g: number; b: number };
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: { r: 0, g: 0, b: 255 },
} satisfies Record<string, Color>;
// palette.red[0] works — array not widened to string

// as const — literal inference
const REQUEST_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;
type RequestStatus =
  (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];
// "idle" | "loading" | "success" | "error"

// satisfies + as const — best of both
const RESPONSE_CODES = {
  OK: 200,
  CREATED: 201,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const satisfies Record<string, number>;
// Narrowed to literal values, validated as number

// satisfies on arrays
const arr = [1, 2, 3] satisfies readonly number[];
// arr is readonly — push/pop disallowed`,
  },
  {
    title: "Configuration (tsconfig.json)",
    code: `{
  "compilerOptions": {
    /* Strictness — enables all strict checks */
    "strict": true,

    /* Target — JS output version */
    "target": "ES2022",

    /* Module system */
    "module": "node16" | "esnext" | "commonjs",
    "moduleResolution": "node16" | "bundler",

    /* Path aliases (with baseUrl) */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
    },

    /* Library definitions available in scope */
    "lib": ["ES2022", "DOM", "DOM.Iterable"],

    /* Other common options */
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve" | "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}`,
  },
];

export default function TypescriptCheatsheet() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/cheatsheets"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Cheatsheets
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">TypeScript Cheatsheet</h1>
        <p className="text-muted-foreground mt-1">
          A quick reference for TypeScript types, generics, utilities, and configuration — covering the essential patterns for everyday development.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="font-mono text-xs leading-relaxed bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre">
                {section.code}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
