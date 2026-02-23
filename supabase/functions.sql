-- ============================================================
-- Helper RPC functions — run in Supabase SQL Editor
-- ============================================================

-- Safely decrement booked_count when a booking is cancelled
create or replace function decrement_booked_count(schedule_id uuid)
returns void as $$
  update schedules
  set booked_count = greatest(booked_count - 1, 0)
  where id = schedule_id;
$$ language sql security definer;
