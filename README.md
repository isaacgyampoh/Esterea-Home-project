# Esterea Home

Décor e-commerce **shop + interior services** for Esterea Home (Accra, Ghana).
Single React app: customers see the storefront; staff use the admin at `/#/admin`.

**Live:** https://estereahome.com · **Admin:** https://estereahome.com/#/admin

## Stack
- React 19 + Vite
- Supabase (Postgres) — data
- Cloudinary — product/service images
- Paystack (Mobile Money) — online checkout
- Deployed on Vercel (auto-deploys from `main`)

## Project structure
```
src/
  App.jsx              Storefront + routes to Admin
  index.css            Storefront styles (green-accent theme)
  admin/
    Admin.jsx          Shell: auth, rail, drawer, router, toasts
    admin.css          Admin design system
    nav.js             Navigation config (single source of truth)
    lib/               supabase, auth, format, cloudinary, hooks, categories
    ui/                Reusable primitives (Modal, Button, fields, Table, …)
    pages/             One file per feature (POS, Products, Services, …)
```

## First-time database setup
Run **`DATABASE_SETUP.sql`** in the Supabase SQL editor. It is idempotent —
safe to run anytime; it only creates what's missing.

## Access & roles
- **Admin** signs in with the admin password (default `esterea2026`,
  changeable in Staff & Access). Full access.
- **Staff / Cashiers** sign in with a 4–6 digit PIN. They only see POS,
  Receipts, Online Orders, and Refunds. Every sale records who made it.

## Image uploads
Cloudinary unsigned preset **`esterea_unsigned`** on cloud **`dls9fai0i`**.

## Receipts
80mm thermal printer. POS shows a printable receipt after each sale.

## Deploy
Push to `main` → Vercel auto-deploys (~60s). Hard-refresh after deploys.
