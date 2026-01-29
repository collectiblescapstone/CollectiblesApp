-- create/replace function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- NEEDS TO BE CHANGED BASED ON THE User TABLE SCHEMA
  INSERT INTO public."User" (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.name);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- NEEDS TO BE CHANGED BASED ON THE User TABLE SCHEMA
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