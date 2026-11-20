create table if not exists public.prediction_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  age integer not null check (age between 1 and 120),
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  bmi double precision not null check (bmi between 10 and 60),
  hba1c double precision not null check (hba1c between 3 and 15),
  blood_glucose double precision not null check (blood_glucose between 50 and 500),
  hypertension smallint not null check (hypertension in (0, 1)),
  heart_disease smallint not null check (heart_disease in (0, 1)),
  smoking_history text not null check (
    smoking_history in ('never', 'former', 'current', 'not current', 'No Info')
  ),
  prediction smallint not null check (prediction in (0, 1)),
  prediction_label text not null check (prediction_label in ('Diabetes', 'No Diabetes')),
  risk_probability double precision not null check (risk_probability between 0 and 1),
  created_at timestamptz not null default now()
);

alter table public.prediction_history enable row level security;

grant usage on schema public to authenticated;
grant insert on table public.prediction_history to authenticated;

drop policy if exists "Authenticated users can insert predictions"
  on public.prediction_history;

create policy "Authenticated users can insert predictions"
  on public.prediction_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);
