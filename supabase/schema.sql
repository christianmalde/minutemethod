-- ============================================================
-- MinuteMethod — Supabase Database Schema
-- Run this in the Supabase SQL Editor (supabase.com dashboard)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles (extends Supabase Auth users) ──────────────────
create table if not exists profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- Auto-create profile on sign up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Services ────────────────────────────────────────────────
create table if not exists services (
  id                uuid default uuid_generate_v4() primary key,
  name              text not null,
  type              text not null check (type in ('class', 'pt')),
  description       text,
  price             numeric(10, 2) not null default 0,
  duration_minutes  integer not null default 60,
  instructor_name   text,
  created_at        timestamptz default now() not null
);

-- ─── Schedules ───────────────────────────────────────────────
create table if not exists schedules (
  id            uuid default uuid_generate_v4() primary key,
  service_id    uuid references services(id) on delete cascade not null,
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  max_capacity  integer not null default 10,
  booked_count  integer not null default 0 check (booked_count >= 0),
  created_at    timestamptz default now() not null,
  constraint capacity_check check (booked_count <= max_capacity)
);

-- ─── Bookings ────────────────────────────────────────────────
create table if not exists bookings (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  schedule_id     uuid references schedules(id) on delete cascade not null,
  status          text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_status  text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  created_at      timestamptz default now() not null,
  unique (user_id, schedule_id)
);

-- ─── Row Level Security ──────────────────────────────────────

-- Profiles: users can read/update their own profile
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Services: public read
alter table services enable row level security;

create policy "Services are publicly readable"
  on services for select using (true);

-- Schedules: public read
alter table schedules enable row level security;

create policy "Schedules are publicly readable"
  on schedules for select using (true);

-- Bookings: users manage their own
alter table bookings enable row level security;

create policy "Users can view own bookings"
  on bookings for select using (auth.uid() = user_id);

create policy "Users can create own bookings"
  on bookings for insert with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on bookings for update using (auth.uid() = user_id);

-- ─── Seed Data ───────────────────────────────────────────────

insert into services (name, type, description, price, duration_minutes, instructor_name) values
  ('Minute Method Strength', 'class', 'Build functional strength with progressive resistance training. Suitable for all fitness levels.', 350.00, 60, 'Christian Malde'),
  ('Minute Method Combo',    'class', 'A dynamic combination of strength and conditioning. The ultimate full-body workout experience.', 350.00, 60, 'Christian Malde'),
  ('Minute Method Exclusive Home Class', 'pt', 'A personalised training session delivered in the comfort of your own home. Tailored entirely to your goals.', 1500.00, 60, 'Christian Malde');

-- Seed schedules for the next 7 days
do $$
declare
  v_service record;
  v_day integer;
  v_hour integer;
  v_start timestamptz;
  v_end timestamptz;
  v_hours integer[] := array[7, 9, 12, 17, 19];
begin
  for v_service in select id, duration_minutes, type from services loop
    for v_day in 0..6 loop
      -- Classes get multiple slots; PT gets fewer
      foreach v_hour in array v_hours loop
        continue when v_service.type = 'pt' and v_hour not in (9, 17);
        v_start := (current_date + v_day) + (v_hour || ' hours')::interval;
        v_end   := v_start + (v_service.duration_minutes || ' minutes')::interval;
        insert into schedules (service_id, start_time, end_time, max_capacity, booked_count)
        values (
          v_service.id,
          v_start,
          v_end,
          case when v_service.type = 'class' then 15 else 1 end,
          0
        );
      end loop;
    end loop;
  end loop;
end $$;
