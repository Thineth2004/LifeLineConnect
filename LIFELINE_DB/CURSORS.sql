CREATE OR REPLACE PROCEDURE update_expired_units
IS

    CURSOR c_expired_units IS
        SELECT unit_id
        FROM blood_unit
        WHERE expiry_date < TRUNC(SYSDATE)
        AND status IN ('Available', 'Reserved');

    v_count NUMBER := 0;

BEGIN

    FOR unit_record IN c_expired_units
    LOOP

        UPDATE blood_unit
        SET status = 'Expired'
        WHERE unit_id = unit_record.unit_id;

        v_count := v_count + 1;

    END LOOP;

    COMMIT;

    DBMS_OUTPUT.PUT_LINE(
        v_count || ' blood unit(s) marked as expired.'
    );

EXCEPTION

    WHEN OTHERS THEN

        DBMS_OUTPUT.PUT_LINE(
            'Error updating expired units: ' || SQLERRM
        );

END;
/

BEGIN
    update_expired_units;
END;
/

