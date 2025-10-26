-- Add phone_no field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone_no text;

-- Add validation trigger for phone number format
CREATE OR REPLACE FUNCTION public.validate_phone_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.phone_no IS NOT NULL AND NEW.phone_no !~ '^\+?[1-9]\d{1,14}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_phone_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_phone_number();