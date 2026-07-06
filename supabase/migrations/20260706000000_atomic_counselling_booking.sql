-- Fixes a double-booking race condition in the public pastoral counselling
-- booking form: the app used to read the slot's current count, then insert,
-- as two separate round trips. Two visitors submitting the same last slot at
-- the same moment could both pass the capacity check and both get inserted.
--
-- This migration is additive/safe to run, with one caveat: step 1 will fail
-- if duplicate (phone, counselling_date, counselling_time) rows already
-- exist. If it fails, find and resolve the duplicates first, e.g.:
--   select phone, counselling_date, counselling_time, count(*)
--   from public.pastoral_counselling
--   group by 1,2,3 having count(*) > 1;
-- then re-run this migration.

-- 1. Hard constraint: a phone number cannot hold two bookings for the same
--    date+time slot.
alter table public.pastoral_counselling
  add constraint pastoral_counselling_phone_date_time_key
  unique (phone, counselling_date, counselling_time);

-- 2. Atomic booking function: takes an advisory lock scoped to the exact
--    slot being booked, so concurrent requests for that slot are serialized
--    before the capacity check runs. This makes the "max 5 per slot" rule
--    race-free without requiring every caller to coordinate locking itself.
create or replace function public.book_counselling_slot(
  p_full_name text,
  p_phone text,
  p_email text,
  p_pastor_id uuid,
  p_counselling_date date,
  p_counselling_time text,
  p_reason text,
  p_max_per_slot int default 5
)
returns public.pastoral_counselling
language plpgsql
as $$
declare
  v_count int;
  v_row public.pastoral_counselling;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_counselling_date::text || p_counselling_time, 0));

  if exists (
    select 1 from public.pastoral_counselling
    where phone = p_phone
      and counselling_date = p_counselling_date
      and counselling_time = p_counselling_time
  ) then
    raise exception 'DUPLICATE_BOOKING';
  end if;

  select count(*) into v_count
  from public.pastoral_counselling
  where counselling_date = p_counselling_date
    and counselling_time = p_counselling_time;

  if v_count >= p_max_per_slot then
    raise exception 'SLOT_FULL';
  end if;

  insert into public.pastoral_counselling (
    full_name, phone, email, pastor_id, counselling_date, counselling_time, reason
  ) values (
    p_full_name, p_phone, p_email, p_pastor_id, p_counselling_date, p_counselling_time, p_reason
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.book_counselling_slot(
  text, text, text, uuid, date, text, text, int
) to anon, authenticated;
