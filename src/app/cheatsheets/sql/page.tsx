"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SqlCheatsheet() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back link */}
      <Link
        href="/cheatsheets"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Cheatsheets
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">SQL Cheatsheet</h1>
        <p className="text-muted-foreground">
          Essential SQL commands for daily CRUD operations — queries, joins, aggregations, and more.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. SELECT Queries */}
        <Card>
          <CardHeader>
            <CardTitle>SELECT Queries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The <code className="text-sm font-mono">SELECT</code> statement retrieves rows from a table. Every CRUD developer reaches for it dozens of times a day.
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2">Basic SELECT</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT id, name, email FROM users;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">SELECT with WHERE</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT * FROM orders
WHERE status = 'pending'
  AND created_at &gt;= '2025-01-01';</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">SELECT with JOIN</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT u.name, o.total, o.created_at
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.active = true;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">GROUP BY &amp; Aggregation</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT status, COUNT(*) AS count, SUM(total) AS revenue
FROM orders
GROUP BY status;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">ORDER BY</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT id, title, created_at
FROM posts
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">HAVING (filter after aggregation)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) &gt; 5
ORDER BY order_count DESC;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Subqueries</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT name, email
FROM users
WHERE id IN (
  SELECT user_id FROM orders WHERE total &gt; 1000
);</pre>
            </div>
          </CardContent>
        </Card>

        {/* 2. INSERT / UPDATE / DELETE */}
        <Card>
          <CardHeader>
            <CardTitle>INSERT / UPDATE / DELETE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The core CRUD triad. Modern PostgreSQL supports the <code className="text-sm font-mono">RETURNING</code> clause, saving you a follow-up <code className="text-sm font-mono">SELECT</code>.
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2">INSERT</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">INSERT INTO users (name, email, role)
VALUES ('Alice', 'alice@example.com', 'admin');</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">INSERT with RETURNING</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">INSERT INTO users (name, email, role)
VALUES ('Bob', 'bob@example.com', 'editor')
RETURNING id, created_at;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">INSERT multiple rows</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">INSERT INTO tags (name, slug) VALUES
  ('JavaScript', 'javascript'),
  ('React', 'react'),
  ('PostgreSQL', 'postgresql')
RETURNING *;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">INSERT … ON CONFLICT (upsert)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">INSERT INTO users (email, name, login_count)
VALUES ('alice@example.com', 'Alice', 1)
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  login_count = users.login_count + 1,
  updated_at = NOW()
RETURNING *;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">UPDATE</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">UPDATE users
SET role = 'moderator', updated_at = NOW()
WHERE email = 'bob@example.com'
RETURNING id, name, role;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">DELETE</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">DELETE FROM sessions
WHERE expires_at &lt; NOW()
RETURNING id, user_id;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">DELETE with JOIN (using USING)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">DELETE FROM orders o
USING users u
WHERE o.user_id = u.id
  AND u.active = false
RETURNING o.id;</pre>
            </div>
          </CardContent>
        </Card>

        {/* 3. Table Operations */}
        <Card>
          <CardHeader>
            <CardTitle>Table Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              DDL statements for creating, altering, and dropping tables, plus the most useful column constraints.
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2">CREATE TABLE</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">CREATE TABLE posts (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  body        TEXT,
  author_id   INTEGER NOT NULL REFERENCES users(id),
  status      VARCHAR(20) NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','published','archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">ALTER TABLE — add column</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">ALTER TABLE posts
ADD COLUMN excerpt VARCHAR(300);</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">ALTER TABLE — add constraint</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">ALTER TABLE comments
ADD CONSTRAINT fk_post
  FOREIGN KEY (post_id) REFERENCES posts(id)
  ON DELETE CASCADE;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">DROP TABLE</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">DROP TABLE IF EXISTS temp_imports CASCADE;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Constraints reference</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">-- Primary key
id  SERIAL PRIMARY KEY

-- Foreign key
author_id  INTEGER REFERENCES authors(id) ON DELETE CASCADE

-- Unique
email  VARCHAR(255) UNIQUE NOT NULL

-- Not null
name   VARCHAR(100) NOT NULL

-- Check
age    INTEGER CHECK (age &gt;= 0 AND age &lt;= 150)

-- Default
created_at  TIMESTAMPTZ DEFAULT NOW()</pre>
            </div>
          </CardContent>
        </Card>

        {/* 4. Aggregation Functions */}
        <Card>
          <CardHeader>
            <CardTitle>Aggregation Functions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Aggregate functions collapse many rows into a single result, usually paired with <code className="text-sm font-mono">GROUP BY</code>.
            </p>

            <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  COUNT(*)                    AS total_orders,
  COUNT(DISTINCT user_id)     AS unique_customers,
  SUM(total)                  AS revenue,
  AVG(total)                  AS avg_order_value,
  MIN(total)                  AS smallest_order,
  MAX(total)                  AS largest_order
FROM orders
WHERE created_at &gt;= NOW() - INTERVAL '30 days';</pre>

            <div>
              <h4 className="text-sm font-semibold mb-2">Aggregation by group</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  category,
  COUNT(*)           AS product_count,
  AVG(price)         AS avg_price,
  MIN(price)         AS min_price,
  MAX(price)         AS max_price
FROM products
GROUP BY category
ORDER BY product_count DESC;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">GROUP_CONCAT (string_agg in PostgreSQL)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  o.id,
  STRING_AGG(p.name, ', ' ORDER BY p.name) AS products
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p    ON p.id = oi.product_id
GROUP BY o.id;</pre>
            </div>
          </CardContent>
        </Card>

        {/* 5. Joins */}
        <Card>
          <CardHeader>
            <CardTitle>Joins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Joins combine rows from two or more tables based on a related column. Knowing when to use each type is essential for writing efficient queries.
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2">INNER JOIN</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON o.user_id = u.id;
-- Only rows where match exists in BOTH tables</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">LEFT JOIN</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;
-- ALL rows from users, NULLs for users with no orders</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">RIGHT JOIN</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT p.title, c.body AS comment
FROM posts p
RIGHT JOIN comments c ON c.post_id = p.id;
-- ALL rows from comments, NULLs for comments with no post</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">FULL OUTER JOIN</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  COALESCE(u.name, '(deleted)') AS user_name,
  o.total
FROM users u
FULL OUTER JOIN orders o ON o.user_id = u.id;
-- ALL rows from BOTH tables, NULLs where no match</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">CROSS JOIN</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT sizes.name, colors.name
FROM sizes
CROSS JOIN colors;
-- Cartesian product: every size × every color</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">SELF JOIN</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
-- Table joined to itself to represent hierarchies</pre>
            </div>
          </CardContent>
        </Card>

        {/* 6. Window Functions */}
        <Card>
          <CardHeader>
            <CardTitle>Window Functions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Window functions perform calculations across a set of rows related to the current row — without collapsing them like <code className="text-sm font-mono">GROUP BY</code>.
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2">ROW_NUMBER</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  id, title, created_at,
  ROW_NUMBER() OVER (ORDER BY created_at DESC) AS row_num
FROM posts;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">RANK &amp; DENSE_RANK</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  name, score,
  RANK()       OVER (ORDER BY score DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM leaderboard;
-- RANK skips positions on ties (1,1,3), DENSE_RANK doesn't (1,1,2)</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">LAG &amp; LEAD</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  date,
  amount,
  LAG(amount, 1)  OVER (ORDER BY date) AS prev_day,
  LEAD(amount, 1) OVER (ORDER BY date) AS next_day,
  amount - LAG(amount, 1) OVER (ORDER BY date) AS day_over_day_change
FROM daily_revenue;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">SUM() OVER (running total)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  date,
  amount,
  SUM(amount) OVER (ORDER BY date) AS running_total
FROM daily_revenue;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Window with PARTITION BY</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  department, name, salary,
  AVG(salary) OVER (PARTITION BY department) AS dept_avg,
  salary - AVG(salary) OVER (PARTITION BY department) AS diff_from_avg
FROM employees;</pre>
            </div>
          </CardContent>
        </Card>

        {/* 7. Common CTEs */}
        <Card>
          <CardHeader>
            <CardTitle>Common Table Expressions (CTEs)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              CTEs (the <code className="text-sm font-mono">WITH</code> clause) let you name a subquery and reuse it in the main query — great for readability and recursive queries.
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2">Simple CTE</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">WITH active_users AS (
  SELECT id, name, email
  FROM users
  WHERE active = true AND last_login &gt; NOW() - INTERVAL '90 days'
)
SELECT a.name, o.total
FROM active_users a
JOIN orders o ON o.user_id = a.id
WHERE o.total &gt; 50;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Multiple CTEs</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">WITH
recent_orders AS (
  SELECT * FROM orders
  WHERE created_at &gt;= NOW() - INTERVAL '7 days'
),
order_stats AS (
  SELECT user_id, COUNT(*) AS cnt, SUM(total) AS total_spent
  FROM recent_orders
  GROUP BY user_id
)
SELECT u.name, COALESCE(os.cnt, 0) AS orders_7d, COALESCE(os.total_spent, 0) AS spent_7d
FROM users u
LEFT JOIN order_stats os ON os.user_id = u.id
ORDER BY spent_7d DESC NULLS LAST;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Recursive CTE (hierarchy)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">WITH RECURSIVE org_tree AS (
  -- Anchor: top-level managers
  SELECT id, name, manager_id, 1 AS level
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- Recursive: direct reports
  SELECT e.id, e.name, e.manager_id, ot.level + 1
  FROM employees e
  JOIN org_tree ot ON ot.id = e.manager_id
)
SELECT * FROM org_tree ORDER BY level, name;</pre>
            </div>
          </CardContent>
        </Card>

        {/* 8. Indexes */}
        <Card>
          <CardHeader>
            <CardTitle>Indexes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Indexes speed up lookups at the cost of slower writes. The right index can turn a 10-second scan into a millisecond seek.
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2">Basic index</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">CREATE INDEX idx_posts_author_id ON posts(author_id);</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">UNIQUE index</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">CREATE UNIQUE INDEX idx_users_email ON users(email);</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Composite index</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">CREATE INDEX idx_orders_user_status
ON orders(user_id, status);
-- Use when filtering by both user_id AND status</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Partial index</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">CREATE INDEX idx_orders_pending
ON orders(created_at)
WHERE status = 'pending';
-- Only indexes rows where status = 'pending'</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Covering index (INCLUDE)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">CREATE INDEX idx_posts_author_covering
ON posts(author_id)
INCLUDE (title, created_at);
-- Index-only scan: no need to visit table heap</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Drop index</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">DROP INDEX IF EXISTS idx_old_unused_index;</pre>
            </div>
          </CardContent>
        </Card>

        {/* 9. Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Transactions group multiple operations into a single atomic unit — all succeed or all roll back. Essential for data integrity in any CRUD application.
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2">Basic transaction</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;
-- Both updates succeed together, or neither does</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Transaction with ROLLBACK</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">BEGIN;

INSERT INTO orders (user_id, total) VALUES (1, 50.00);

-- Oops, something went wrong — undo everything
ROLLBACK;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">SAVEPOINT (nested rollback)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">BEGIN;

INSERT INTO audit_log (action) VALUES ('batch_start');

SAVEPOINT before_insert;
INSERT INTO users (name, email) VALUES ('Charlie', 'charlie@example.com');

-- Something wrong with Charlie, roll back just that insert
ROLLBACK TO SAVEPOINT before_insert;

INSERT INTO users (name, email) VALUES ('Diana', 'diana@example.com');

COMMIT;
-- Charlie is NOT inserted; Diana IS; audit log saved</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Transaction with error handling (PL/pgSQL)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">DO $$
BEGIN
  BEGIN
    INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice');
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'User already exists, skipping';
  END;
END $$;</pre>
            </div>
          </CardContent>
        </Card>

        {/* 10. PostgreSQL Specific */}
        <Card>
          <CardHeader>
            <CardTitle>PostgreSQL Specific Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              PostgreSQL offers powerful data types and operators not found in standard SQL — especially for JSON, arrays, and set generation.
            </p>

            <div>
              <h4 className="text-sm font-semibold mb-2">JSON operators — access fields</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">SELECT
  metadata-&gt;'author'    AS author_json,    -- returns JSON
  metadata-&gt;&gt;'title'    AS title_text,     -- returns TEXT
  metadata-&gt;'tags'      AS tags_json,      -- returns JSON array
  metadata-&gt;'address'-&gt;&gt;'city' AS city     -- nested path
FROM articles
WHERE metadata @&gt; '&#123;"published": true&#125;';    -- JSON containment check</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">JSON path queries (PostgreSQL 12+)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">-- Find articles where any tag starts with "react"
SELECT id, metadata-&gt;&gt;'title' AS title
FROM articles
WHERE metadata @@ '$.tags[*] like_regex "react" flag "i"';</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">JSON_QUERY / JSON_VALUE (SQL/JSON)</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">-- PostgreSQL 15+ SQL/JSON standard functions
SELECT
  JSON_VALUE(metadata, '$.title')       AS title,
  JSON_QUERY(metadata, '$.tags')        AS tags,
  JSON_VALUE(metadata, '$.price' RETURNING NUMERIC) AS price
FROM products
WHERE JSON_VALUE(metadata, '$.active')::boolean = true;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">ARRAY type &amp; operations</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">-- Create table with array column
CREATE TABLE articles (
  id    SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  tags  TEXT[]              -- array of text
);

-- Query with array operators
SELECT id, title
FROM articles
WHERE tags @&gt; ARRAY['react'];              -- contains 'react'
WHERE tags &amp;&amp; ARRAY['react','vue'];         -- overlaps (any match)
WHERE 'react' = ANY(tags);                  -- exact membership

-- Array indexing (1-based in SQL)
SELECT title, tags[1] AS primary_tag
FROM articles;</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">UNNEST — expand arrays to rows</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">-- Flatten array into one row per element
SELECT
  a.id,
  a.title,
  UNNEST(a.tags) AS single_tag
FROM articles a;

-- With ordinality (preserves position)
SELECT
  a.id,
  t.tag,
  t.ordinality AS position
FROM articles a,
LATERAL UNNEST(a.tags) WITH ORDINALITY AS t(tag);</pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">GENERATE_SERIES — create row sets</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">-- Generate a sequence of numbers
SELECT GENERATE_SERIES(1, 10) AS num;

-- Generate a calendar (super useful for reporting)
SELECT d::DATE AS date
FROM GENERATE_SERIES(
  '2025-01-01'::DATE,
  '2025-01-31'::DATE,
  '1 day'::INTERVAL
) AS d;

-- Cartesian product with real data
SELECT
  d.date,
  COALESCE(SUM(o.total), 0) AS daily_revenue
FROM GENERATE_SERIES(
  '2025-01-01'::DATE, '2025-01-31'::DATE, '1 day'
) AS d
LEFT JOIN orders o ON o.created_at::DATE = d.date
GROUP BY d.date
ORDER BY d.date;</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
