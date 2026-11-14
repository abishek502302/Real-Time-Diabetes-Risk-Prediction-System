alter table public.prediction_history enable row level security;

grant usage on schema public to authenticated;
grant insert on table public.prediction_history to authenticated;

drop policy if exists "Authenticated users can insert predictions"
  on public.prediction_history;

create policy "Authenticated users can insert predictions"
  on public.prediction_history
  for insert
  to authenticated
  with check (auth.uid() is not null);
