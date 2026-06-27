alter table profiles add column if not exists boosted_until timestamptz;

alter table messages add column if not exists read_at timestamptz;
