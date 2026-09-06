CREATE OR REPLACE PROCEDURE rpt_blood_collection
IS

    CURSOR c_collection IS
        SELECT
            bg.blood_group,
            c.camp_name,
            COUNT(bu.unit_id) AS units_collected,
            SUM(d.quantity_ml) AS total_ml
        FROM blood_group bg
        JOIN blood_unit bu
            ON bg.blood_group_id = bu.blood_group_id
        JOIN donation d
            ON bu.donation_id = d.donation_id
        JOIN camp c
            ON d.camp_id = c.camp_id
        GROUP BY
            bg.blood_group,
            c.camp_name
        ORDER BY
            bg.blood_group,
            c.camp_name;

BEGIN

    DBMS_OUTPUT.PUT_LINE(
        '===== BLOOD COLLECTION REPORT ====='
    );

    FOR r IN c_collection
    LOOP

        DBMS_OUTPUT.PUT_LINE(
            'Blood Group: ' || r.blood_group ||
            ' | Camp: ' || r.camp_name ||
            ' | Units: ' || r.units_collected ||
            ' | Volume: ' || r.total_ml || ' ml'
        );

    END LOOP;

EXCEPTION

    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(
            'Report error: ' || SQLERRM
        );

END;
/

BEGIN
    rpt_blood_collection;
END;
/

CREATE OR REPLACE PROCEDURE rpt_current_inventory
IS
    CURSOR c_inventory IS
        SELECT
            bg.blood_group,
            COUNT(bu.unit_id) AS available_units
        FROM blood_group bg
        LEFT JOIN blood_unit bu
            ON bg.blood_group_id = bu.blood_group_id
            AND bu.status = 'Available'
            AND bu.expiry_date >= TRUNC(SYSDATE)
        GROUP BY bg.blood_group
        ORDER BY bg.blood_group;

BEGIN

    DBMS_OUTPUT.PUT_LINE(
        '===== CURRENT BLOOD INVENTORY ====='
    );

    FOR r IN c_inventory
    LOOP
        DBMS_OUTPUT.PUT_LINE(
            'Blood Group: ' || r.blood_group ||
            ' | Available Units: ' || r.available_units
        );
    END LOOP;

EXCEPTION

    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(
            'Inventory report error: ' || SQLERRM
        );

END;
/

BEGIN
    rpt_current_inventory;
END;
/

CREATE OR REPLACE PROCEDURE rpt_expiring_units (
    p_days IN NUMBER
)
IS
    CURSOR c_expiring IS
        SELECT
            bu.unit_id,
            bg.blood_group,
            bu.collection_date,
            bu.expiry_date,
            bu.status,
            bu.storage_location
        FROM blood_unit bu
        JOIN blood_group bg
            ON bu.blood_group_id = bg.blood_group_id
        WHERE bu.expiry_date >= TRUNC(SYSDATE)
        AND bu.expiry_date <= TRUNC(SYSDATE) + p_days
        AND bu.status = 'Available'
        ORDER BY bu.expiry_date;

BEGIN

    DBMS_OUTPUT.PUT_LINE(
        '===== EXPIRING BLOOD UNITS ====='
    );

    DBMS_OUTPUT.PUT_LINE(
        'Checking next ' || p_days || ' day(s)...'
    );

    FOR r IN c_expiring
    LOOP

        DBMS_OUTPUT.PUT_LINE(
            'Unit: ' || r.unit_id ||
            ' | Blood Group: ' || r.blood_group ||
            ' | Expiry: ' || TO_CHAR(r.expiry_date, 'DD-MON-YYYY') ||
            ' | Location: ' || r.storage_location
        );

    END LOOP;

EXCEPTION

    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(
            'Expiry report error: ' || SQLERRM
        );

END;
/

BEGIN
    rpt_expiring_units(30);
END;
/

CREATE OR REPLACE PROCEDURE rpt_donor_history (
    p_donor_id IN VARCHAR2
)
IS
    v_first_name       donor.first_name%TYPE;
    v_last_name        donor.last_name%TYPE;
    v_blood_group      blood_group.blood_group%TYPE;
    v_eligibility      VARCHAR2(30);

BEGIN

    -- Get donor information
    SELECT
        d.first_name,
        d.last_name,
        bg.blood_group
    INTO
        v_first_name,
        v_last_name,
        v_blood_group
    FROM donor d
    JOIN blood_group bg
        ON d.blood_group_id = bg.blood_group_id
    WHERE d.donor_id = p_donor_id;


    -- Check current eligibility
    v_eligibility := check_donor_eligibility(p_donor_id);


    DBMS_OUTPUT.PUT_LINE(
        '===== DONOR REPORT ====='
    );

    DBMS_OUTPUT.PUT_LINE(
        'Donor ID: ' || p_donor_id
    );

    DBMS_OUTPUT.PUT_LINE(
        'Name: ' || v_first_name || ' ' || v_last_name
    );

    DBMS_OUTPUT.PUT_LINE(
        'Blood Group: ' || v_blood_group
    );

    DBMS_OUTPUT.PUT_LINE(
        'Eligibility: ' || v_eligibility
    );

    DBMS_OUTPUT.PUT_LINE(
        '----- Donation History -----'
    );


    -- Display donation history
    FOR r IN (
        SELECT
            d.donation_id,
            d.donation_date,
            d.quantity_ml,
            c.camp_name
        FROM donation d
        JOIN camp c
            ON d.camp_id = c.camp_id
        WHERE d.donor_id = p_donor_id
        ORDER BY d.donation_date DESC
    )
    LOOP

        DBMS_OUTPUT.PUT_LINE(
            'Donation: ' || r.donation_id ||
            ' | Date: ' || TO_CHAR(r.donation_date, 'DD-MON-YYYY') ||
            ' | Quantity: ' || r.quantity_ml || ' ml' ||
            ' | Camp: ' || r.camp_name
        );

    END LOOP;


EXCEPTION

    WHEN NO_DATA_FOUND THEN

        DBMS_OUTPUT.PUT_LINE(
            'Donor ' || p_donor_id || ' was not found.'
        );

    WHEN OTHERS THEN

        DBMS_OUTPUT.PUT_LINE(
            'Donor report error: ' || SQLERRM
        );

END;
/

BEGIN
    rpt_donor_history('D001');
END;
/

CREATE OR REPLACE PROCEDURE rpt_hospital_requests
IS
    CURSOR c_requests IS
        SELECT
            br.request_id,
            h.hospital_name,
            bg.blood_group,
            br.quantity_required,
            br.urgency,
            br.status,
            br.required_date
        FROM blood_request br
        JOIN hospital h
            ON br.hospital_id = h.hospital_id
        JOIN blood_group bg
            ON br.blood_group_id = bg.blood_group_id
        ORDER BY
            CASE br.urgency
                WHEN 'Critical' THEN 1
                WHEN 'Urgent' THEN 2
                WHEN 'Normal' THEN 3
            END,
            br.required_date;

BEGIN

    DBMS_OUTPUT.PUT_LINE(
        '===== HOSPITAL BLOOD REQUEST REPORT ====='
    );

    FOR r IN c_requests
    LOOP

        DBMS_OUTPUT.PUT_LINE(
            'Request: ' || r.request_id ||
            ' | Hospital: ' || r.hospital_name ||
            ' | Blood Group: ' || r.blood_group ||
            ' | Quantity: ' || r.quantity_required ||
            ' | Urgency: ' || r.urgency ||
            ' | Status: ' || r.status ||
            ' | Required: ' ||
            NVL(TO_CHAR(r.required_date, 'DD-MON-YYYY'), 'N/A')
        );

    END LOOP;

EXCEPTION

    WHEN OTHERS THEN

        DBMS_OUTPUT.PUT_LINE(
            'Hospital request report error: ' || SQLERRM
        );

END;
/

BEGIN
    rpt_hospital_requests;
END;
/

SELECT object_name, object_type, status
FROM user_objects
WHERE object_type IN ('PROCEDURE', 'FUNCTION', 'TRIGGER')
ORDER BY object_type, object_name;