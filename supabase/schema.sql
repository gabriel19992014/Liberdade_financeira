create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  security_question text not null,
  security_answer_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'savings')),
  classification text,
  category text not null,
  amount numeric(14, 2) not null,
  description text,
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(date);
