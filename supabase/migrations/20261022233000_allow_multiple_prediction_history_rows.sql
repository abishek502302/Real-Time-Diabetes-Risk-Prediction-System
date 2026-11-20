alter table public.prediction_history
  add column if not exists id uuid not null default gen_random_uuid();

alter table public.prediction_history
  drop constraint if exists prediction_history_pkey;

alter table public.prediction_history
  add constraint prediction_history_pkey primary key (id);
