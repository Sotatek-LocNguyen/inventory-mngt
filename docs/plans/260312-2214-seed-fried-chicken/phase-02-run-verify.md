# Phase 02 — Run Seed and Verify

**Objective:** Execute the seed script against `inventory_dev` and confirm all rows were inserted correctly.

---

## Task 2.1 — Run the seed script

```bash
cd apps/api
bun run seed
```

Expected output:
```
Seed complete.
```

---

## Task 2.2 — Verify row counts in the database

```bash
psql "postgresql://inventory:inventory@localhost:5432/inventory_dev" -c "
  SELECT 'categories' AS table, COUNT(*) FROM \"Category\"
  UNION ALL
  SELECT 'suppliers',           COUNT(*) FROM \"Supplier\"
  UNION ALL
  SELECT 'products',            COUNT(*) FROM \"Product\"
  UNION ALL
  SELECT 'transactions',        COUNT(*) FROM \"Transaction\";
"
```

Expected result:

| table        | count |
|--------------|-------|
| categories   | 4     |
| suppliers    | 3     |
| products     | 12    |
| transactions | 12    |

---

## Task 2.3 — Verify idempotency

Run the seed a second time and confirm counts do not increase:

```bash
bun run seed
psql "postgresql://inventory:inventory@localhost:5432/inventory_dev" -c "SELECT COUNT(*) FROM \"Product\";"
```

Expected: still `12` — no duplicates created.

---

## Exit Criteria

- All four tables have the expected row counts
- Second run produces identical counts (idempotent)
- `bun run seed` exits with code `0`
