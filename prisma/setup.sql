-- To run this setup script, execute: npx prisma db execute --file prisma\setup.sql --schema prisma\schema.prisma

-- (re)create function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public."User" (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.name);
  RETURN NEW;
END;
$$;

-- (re)create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

INSERT INTO public."User" (id, email)
SELECT 
  id, 
  email 
FROM auth.users
ON CONFLICT (id) DO NOTHING;