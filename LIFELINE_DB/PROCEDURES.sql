CREATE OR REPLACE PROCEDURE register_donor (
    p_donor_id          IN VARCHAR2,
    p_first_name        IN VARCHAR2,
    p_last_name         IN VARCHAR2,
    p_date_of_birth     IN DATE,
    p_gender            IN VARCHAR2,
    p_nic               IN VARCHAR2,
    p_phone             IN VARCHAR2,
    p_email             IN VARCHAR2,
    p_address           IN VARCHAR2,
    p_blood_group_id    IN VARCHAR2
)
IS
BEGIN

    INSERT INTO donor (
        donor_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        nic,
        phone,
        email,
        address,
        blood_group_id,
        registration_date,
        status
    )
    VALUES (
        p_donor_id,
        p_first_name,
        p_last_name,
        p_date_of_birth,
        p_gender,
        p_nic,
        p_phone,
        p_email,
        p_address,
        p_blood_group_id,
        SYSDATE,
        'Active'
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE(
        'Donor ' || p_donor_id || ' registered successfully.'
    );

EXCEPTION

    WHEN DUP_VAL_ON_INDEX THEN
        DBMS_OUTPUT.PUT_LINE(
            'Error: Donor ID or NIC already exists.'
        );

    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(
            'Error registering donor: ' || SQLERRM
        );

END;
/

SET SERVEROUTPUT ON;

BEGIN
    register_donor(
        'D021',
        'Kasun',
        'Perera',
        DATE '2002-05-15',
        'Male',
        '200215678901',
        '0771234567',
        'kasun@gmail.com',
        'Matara',
        'BG01'
    );
END;
/

SELECT *
FROM donor
WHERE donor_id = 'D021';

CREATE OR REPLACE PROCEDURE record_donation (
    p_donation_id    IN VARCHAR2,
    p_donor_id       IN VARCHAR2,
    p_camp_id        IN VARCHAR2,
    p_health_id      IN VARCHAR2,
    p_donation_date  IN DATE,
    p_quantity_ml    IN NUMBER,
    p_unit_id        IN VARCHAR2,
    p_expiry_date    IN DATE,
    p_storage        IN VARCHAR2
)
IS
    v_eligibility    VARCHAR2(30);
    v_blood_group    donor.blood_group_id%TYPE;
    v_camp_status    camp.status%TYPE;
BEGIN

    -- 1. Check donor eligibility
    v_eligibility := check_donor_eligibility(p_donor_id);

    IF v_eligibility <> 'ELIGIBLE' THEN

        RAISE_APPLICATION_ERROR(
            -20001,
            'Donor is not eligible for donation.'
        );

    END IF;


    -- 2. Check camp status
    SELECT status
    INTO v_camp_status
    FROM camp
    WHERE camp_id = p_camp_id;

    IF v_camp_status = 'Cancelled' THEN

        RAISE_APPLICATION_ERROR(
            -20002,
            'Cannot record donation for a cancelled camp.'
        );

    END IF;


    -- 3. Get donor blood group
    SELECT blood_group_id
    INTO v_blood_group
    FROM donor
    WHERE donor_id = p_donor_id;


    -- 4. Insert donation
    INSERT INTO donation (
        donation_id,
        donor_id,
        camp_id,
        health_id,
        donation_date,
        quantity_ml,
        remarks
    )
    VALUES (
        p_donation_id,
        p_donor_id,
        p_camp_id,
        p_health_id,
        p_donation_date,
        p_quantity_ml,
        'Donation recorded through system'
    );


    -- 5. Create blood unit
    INSERT INTO blood_unit (
        unit_id,
        donation_id,
        blood_group_id,
        collection_date,
        expiry_date,
        status,
        storage_location
    )
    VALUES (
        p_unit_id,
        p_donation_id,
        v_blood_group,
        p_donation_date,
        p_expiry_date,
        'Available',
        p_storage
    );


    COMMIT;

    DBMS_OUTPUT.PUT_LINE(
        'Donation recorded successfully.'
    );

    DBMS_OUTPUT.PUT_LINE(
        'Blood unit ' || p_unit_id || ' added to inventory.'
    );


EXCEPTION

    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE(
            'Error: Donor, health record or camp not found.'
        );

    WHEN DUP_VAL_ON_INDEX THEN
        DBMS_OUTPUT.PUT_LINE(
            'Error: Donation ID or Blood Unit ID already exists.'
        );

    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(
            'Error recording donation: ' || SQLERRM
        );

END;
/

BEGIN
    record_donation(
        'DN021',
        'D021',
        'C008',
        'H021',
        DATE '2026-09-05',
        450,
        'BU021',
        DATE '2026-10-17',
        'Cold Storage A'
    );
END;
/

SELECT *
FROM donation
WHERE donation_id = 'DN021';

SELECT *
FROM blood_unit
WHERE unit_id = 'BU021';

SELECT *
FROM donor_health
WHERE donor_id = 'D021';

SELECT donor_id, health_id, eligible
FROM donor_health
ORDER BY donor_id;

INSERT INTO donor_health (
    health_id,
    donor_id,
    weight,
    blood_pressure,
    hemoglobin,
    medical_conditions,
    last_check_date,
    eligible,
    remarks
)
VALUES (
    'H021',
    'D021',
    65,
    '120/80',
    14.5,
    'None',
    SYSDATE,
    'YES',
    'Eligible for donation'
);

COMMIT;

SELECT donor_id, health_id, eligible, last_check_date
FROM donor_health
WHERE donor_id = 'D021';

SELECT check_donor_eligibility('D021')
FROM dual;

CREATE OR REPLACE PROCEDURE get_blood_collection_report (
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN

    OPEN p_result FOR
        SELECT
            c.camp_id,
            c.camp_name,
            bg.blood_group,
            COUNT(bu.unit_id) AS units_collected,
            SUM(d.quantity_ml) AS total_ml
        FROM camp c
        JOIN donation d
            ON c.camp_id = d.camp_id
        JOIN blood_unit bu
            ON d.donation_id = bu.donation_id
        JOIN blood_group bg
            ON bu.blood_group_id = bg.blood_group_id
        GROUP BY
            c.camp_id,
            c.camp_name,
            bg.blood_group
        ORDER BY
            c.camp_id,
            bg.blood_group;

END;
/

SELECT object_name, status
FROM user_objects
WHERE object_name = 'GET_BLOOD_COLLECTION_REPORT';

VARIABLE rc REFCURSOR;

BEGIN
    get_blood_collection_report(:rc);
END;
/

PRINT rc;


