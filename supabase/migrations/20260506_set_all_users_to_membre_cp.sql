-- Set all users to membre_cp except samuel.creatiftech@gmail.com
UPDATE public.profiles
SET role = 'membre_cp'
WHERE id != (
  SELECT id FROM auth.users WHERE email = 'samuel.creatiftech@gmail.com'
);
