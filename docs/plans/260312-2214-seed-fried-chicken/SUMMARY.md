# Seed: Fried Chicken Demo Data

**Created:** 2026-03-12 22:14:03
**Status:** Ready for execution

## Goal

Populate `inventory_dev` with realistic fried chicken shop demo data so the app is ready for local development and UI demos without manual data entry.

## Scope

- Create `apps/api/prisma/seed.ts` — idempotent Prisma seed script
- Register seed in `apps/api/package.json` under `prisma.seed`
- Add a `seed` npm script for convenience
- Seed data covers: categories, suppliers, products, and initial stock-in transactions

## Out of Scope

- Production database seeding
- `inventory_test` database (tests manage their own fixtures)

## Phases

| # | File | Description |
|---|------|-------------|
| 1 | [phase-01-seed-script.md](./phase-01-seed-script.md) | Write and register the seed script |
| 2 | [phase-02-run-verify.md](./phase-02-run-verify.md) | Run seed and verify data in the database |

## Seed Data Summary

### Categories (4)
- Whole Chicken
- Chicken Parts
- Sides & Sauces
- Packaging

### Suppliers (3)
- Golden Farm Poultry (phone + email)
- Fresh Wing Co. (phone + email)
- Pack & Go Supplies (email only)

### Products (12)
| SKU | Name | Unit | Cost | Sale | Low Stock |
|-----|------|------|------|------|-----------|
| WC-001 | Whole Chicken (1kg) | kg | 45,000 | 65,000 | 20 |
| WC-002 | Whole Chicken (1.5kg) | kg | 65,000 | 90,000 | 15 |
| CP-001 | Drumstick | piece | 12,000 | 18,000 | 50 |
| CP-002 | Chicken Wing | piece | 10,000 | 15,000 | 50 |
| CP-003 | Chicken Thigh | piece | 14,000 | 20,000 | 30 |
| CP-004 | Chicken Breast | piece | 16,000 | 25,000 | 30 |
| SS-001 | Signature Dipping Sauce | bottle | 8,000 | 15,000 | 20 |
| SS-002 | Spicy Marinade | bottle | 10,000 | 18,000 | 20 |
| SS-003 | Coleslaw (200g) | box | 5,000 | 12,000 | 15 |
| PK-001 | Paper Box (Small) | pack | 2,000 | 5,000 | 100 |
| PK-002 | Paper Box (Large) | pack | 3,000 | 7,000 | 100 |
| PK-003 | Kraft Bag | pack | 1,500 | 4,000 | 100 |

### Initial Stock (STOCK_IN transactions)
Each product receives one opening stock transaction with realistic opening quantities.

## Assumptions

- Database is running and `inventory_dev` schema is migrated
- Script is idempotent: uses `upsert` on unique fields to avoid duplicate errors on re-runs
- Prices are in VND (Vietnamese Dong) — integers stored as Decimal

## Risks

- None significant — seed is isolated to `inventory_dev` and uses upsert
