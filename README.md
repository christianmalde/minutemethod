# MinuteMethod

A React Native (Expo) mobile app for booking gym classes and personal trainer sessions.

## Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo (SDK 52) |
| Routing | Expo Router v4 |
| Backend / Auth / DB | Supabase |
| Styling | NativeWind v4 (Tailwind CSS for RN) |

## Quick Start

### 1. Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo`
- Expo Go app on your phone (or a simulator)

### 2. Clone & Install

```bash
cd minutemethod
npm install
```

### 3. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `supabase/schema.sql` (creates tables + seeds data)
3. Run `supabase/functions.sql` (RPC helpers)
4. Copy your project URL and anon key from **Settings → API**

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env and fill in your Supabase URL and anon key
```

### 5. Run

```bash
npm start
# Scan the QR code with Expo Go, or press 'i' for iOS simulator
```

## Project Structure

```
minutemethod/
├── app/
│   ├── _layout.tsx          ← Root layout + auth guard
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   └── (app)/
│       ├── _layout.tsx      ← Tab navigator
│       ├── index.tsx        ← Home: browse services
│       ├── schedule.tsx     ← Date + time slot picker
│       ├── booking-confirm.tsx
│       └── my-bookings.tsx
├── components/
│   ├── ClassCard.tsx
│   ├── TimeSlot.tsx
│   └── BookingCard.tsx
├── lib/
│   └── supabase.ts          ← Supabase client + types
└── supabase/
    ├── schema.sql            ← DB tables + seed data
    └── functions.sql         ← RPC helpers
```

## Screen Flow

```
Login / Sign Up
      ↓
 Home Screen  (filter by class / PT)
      ↓
Schedule Screen  (pick date → pick time slot)
      ↓
Booking Confirm  (review details → confirm)
      ↓
My Bookings  (upcoming / past, cancel)
```

## Supabase Auth Notes

- Email confirmation is **on** by default. Users must verify their email before signing in.
- To disable for testing: Supabase Dashboard → Authentication → Email → "Confirm email" toggle off.

## Phase 2 — Payments (Stripe)

Install the SDK when ready:

```bash
npx expo install @stripe/stripe-react-native
```

Add `app/(app)/payment.tsx` and integrate after `booking-confirm.tsx`.
