CREATE OR REPLACE FUNCTION check_donor_eligibility (
    p_donor_id IN VARCHAR2
)
RETURN VARCHAR2
IS
    v_status       donor.status%TYPE;
    v_eligible     donor_health.eligible%TYPE;
BEGIN

    -- Check whether donor exists
    SELECT status
    INTO v_status
    FROM donor
    WHERE donor_id = p_donor_id;

    -- Check donor's latest health record
    SELECT eligible
    INTO v_eligible
    FROM (
        SELECT eligible
        FROM donor_health
        WHERE donor_id = p_donor_id
        ORDER BY last_check_date DESC
    )
    WHERE ROWNUM = 1;

    IF v_status = 'Active' AND v_eligible = 'YES' THEN
        RETURN 'ELIGIBLE';
    ELSE
        RETURN 'NOT ELIGIBLE';
    END IF;

EXCEPTION

    WHEN NO_DATA_FOUND THEN
        RETURN 'DONOR NOT FOUND';

    WHEN OTHERS THEN
        RETURN 'ERROR: ' || SQLERRM;

END;
/

SELECT check_donor_eligibility('D001')
FROM dual;

SELECT check_donor_eligibility('D005')
FROM dual;