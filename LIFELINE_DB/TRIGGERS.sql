CREATE OR REPLACE TRIGGER trg_blood_unit_expiry
BEFORE INSERT OR UPDATE ON blood_unit
FOR EACH ROW
BEGIN

    IF :NEW.expiry_date < TRUNC(SYSDATE)
       AND :NEW.status IN ('Available', 'Reserved') THEN

        :NEW.status := 'Expired';

    END IF;

END;
/