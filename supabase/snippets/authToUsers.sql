INSERT INTO public."User" (id, email)
SELECT 
  id, 
  email 
FROM auth.users
ON CONFLICT (id) DO NOTHING;