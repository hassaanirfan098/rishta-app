-- Payments log
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null, -- unlock | bundle | gold_monthly | gold_yearly
  amount integer, -- in paisas
  currency text default 'PKR',
  safepay_token text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table payments enable row level security;

create policy "users can read own payments"
  on payments for select
  using (auth.uid() = user_id);

-- Gold membership columns
alter table profiles add column if not exists is_gold boolean default false;
alter table profiles add column if not exists gold_until timestamptz;
alter table profiles add column if not exists unlock_credits integer default 0;
