CREATE TABLE blood_group (
    blood_group_id VARCHAR2(10) PRIMARY KEY,
    blood_group    VARCHAR2(5) NOT NULL UNIQUE
);

INSERT INTO blood_group VALUES ('BG01', 'O+');
INSERT INTO blood_group VALUES ('BG02', 'O-');
INSERT INTO blood_group VALUES ('BG03', 'A+');
INSERT INTO blood_group VALUES ('BG04', 'A-');
INSERT INTO blood_group VALUES ('BG05', 'B+');
INSERT INTO blood_group VALUES ('BG06', 'B-');
INSERT INTO blood_group VALUES ('BG07', 'AB+');
INSERT INTO blood_group VALUES ('BG08', 'AB-');

COMMIT;


CREATE TABLE venue (
    venue_id        VARCHAR2(10) PRIMARY KEY,
    venue_name      VARCHAR2(100) NOT NULL,
    address         VARCHAR2(200) NOT NULL,
    city            VARCHAR2(50) NOT NULL,
    capacity        NUMBER(5) CHECK (capacity > 0),
    contact_number  VARCHAR2(15)
);

CREATE TABLE donor (
    donor_id           VARCHAR2(10) PRIMARY KEY,
    first_name         VARCHAR2(50) NOT NULL,
    last_name          VARCHAR2(50) NOT NULL,
    date_of_birth      DATE NOT NULL,
    gender             VARCHAR2(10),
    nic                VARCHAR2(20) UNIQUE NOT NULL,
    phone              VARCHAR2(15),
    email              VARCHAR2(100),
    address            VARCHAR2(200),
    blood_group_id     VARCHAR2(10) NOT NULL,
    registration_date  DATE DEFAULT SYSDATE,
    status             VARCHAR2(20) DEFAULT 'Active',

    CONSTRAINT fk_donor_blood_group
        FOREIGN KEY (blood_group_id)
        REFERENCES blood_group(blood_group_id),

    CONSTRAINT chk_donor_status
        CHECK (status IN ('Active', 'Inactive'))
);

CREATE TABLE donor_health (
    health_id           VARCHAR2(10) PRIMARY KEY,
    donor_id            VARCHAR2(10) NOT NULL,
    weight              NUMBER(5,2),
    blood_pressure      VARCHAR2(20),
    hemoglobin          NUMBER(4,2),
    medical_conditions  VARCHAR2(500),
    last_check_date     DATE NOT NULL,
    eligible            VARCHAR2(5) DEFAULT 'YES',
    remarks             VARCHAR2(500),

    CONSTRAINT fk_health_donor
        FOREIGN KEY (donor_id)
        REFERENCES donor(donor_id),

    CONSTRAINT chk_health_eligible
        CHECK (eligible IN ('YES', 'NO')),

    CONSTRAINT chk_health_weight
        CHECK (weight > 0),

    CONSTRAINT chk_health_hemoglobin
        CHECK (hemoglobin > 0)
);

CREATE TABLE camp (
    camp_id       VARCHAR2(10) PRIMARY KEY,
    venue_id      VARCHAR2(10) NOT NULL,
    camp_name     VARCHAR2(100) NOT NULL,
    camp_date     DATE NOT NULL,
    start_time    VARCHAR2(10),
    end_time      VARCHAR2(10),
    organizer     VARCHAR2(100),
    status        VARCHAR2(20) DEFAULT 'Scheduled',

    CONSTRAINT fk_camp_venue
        FOREIGN KEY (venue_id)
        REFERENCES venue(venue_id),

    CONSTRAINT chk_camp_status
        CHECK (status IN ('Scheduled', 'Completed', 'Cancelled'))
);

CREATE TABLE donation (
    donation_id    VARCHAR2(10) PRIMARY KEY,
    donor_id       VARCHAR2(10) NOT NULL,
    camp_id        VARCHAR2(10) NOT NULL,
    health_id      VARCHAR2(10) NOT NULL,
    donation_date  DATE NOT NULL,
    quantity_ml    NUMBER(5) NOT NULL,
    remarks        VARCHAR2(500),

    CONSTRAINT fk_donation_donor
        FOREIGN KEY (donor_id)
        REFERENCES donor(donor_id),

    CONSTRAINT fk_donation_camp
        FOREIGN KEY (camp_id)
        REFERENCES camp(camp_id),

    CONSTRAINT fk_donation_health
        FOREIGN KEY (health_id)
        REFERENCES donor_health(health_id),

    CONSTRAINT chk_donation_quantity
        CHECK (quantity_ml > 0)
);

CREATE TABLE blood_unit (
    unit_id            VARCHAR2(10) PRIMARY KEY,
    donation_id        VARCHAR2(10) NOT NULL,
    blood_group_id     VARCHAR2(10) NOT NULL,
    collection_date    DATE NOT NULL,
    expiry_date        DATE NOT NULL,
    status             VARCHAR2(20) DEFAULT 'Available',
    storage_location   VARCHAR2(100),

    CONSTRAINT fk_unit_donation
        FOREIGN KEY (donation_id)
        REFERENCES donation(donation_id),

    CONSTRAINT fk_unit_blood_group
        FOREIGN KEY (blood_group_id)
        REFERENCES blood_group(blood_group_id),

    CONSTRAINT chk_unit_status
        CHECK (status IN ('Available', 'Reserved', 'Distributed', 'Expired')),

    CONSTRAINT chk_unit_dates
        CHECK (expiry_date > collection_date)
);

CREATE TABLE hospital (
    hospital_id     VARCHAR2(10) PRIMARY KEY,
    hospital_name   VARCHAR2(150) NOT NULL,
    address         VARCHAR2(200) NOT NULL,
    city            VARCHAR2(50) NOT NULL,
    contact_person  VARCHAR2(100),
    phone           VARCHAR2(15),
    email           VARCHAR2(100)
);

CREATE TABLE blood_request (
    request_id         VARCHAR2(10) PRIMARY KEY,
    hospital_id        VARCHAR2(10) NOT NULL,
    blood_group_id     VARCHAR2(10) NOT NULL,
    request_date       DATE DEFAULT SYSDATE,
    quantity_required  NUMBER(5) NOT NULL,
    urgency            VARCHAR2(20) DEFAULT 'Normal',
    status             VARCHAR2(20) DEFAULT 'Pending',
    required_date      DATE,
    remarks            VARCHAR2(500),

    CONSTRAINT fk_request_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospital(hospital_id),

    CONSTRAINT fk_request_blood_group
        FOREIGN KEY (blood_group_id)
        REFERENCES blood_group(blood_group_id),

    CONSTRAINT chk_request_quantity
        CHECK (quantity_required > 0),

    CONSTRAINT chk_request_urgency
        CHECK (urgency IN ('Normal', 'Urgent', 'Critical')),

    CONSTRAINT chk_request_status
        CHECK (status IN ('Pending', 'Approved', 'Partially Fulfilled',
                          'Completed', 'Rejected'))
);

CREATE TABLE blood_distribution (
    distribution_id    VARCHAR2(10) PRIMARY KEY,
    request_id         VARCHAR2(10) NOT NULL,
    unit_id            VARCHAR2(10) NOT NULL,
    distribution_date  DATE DEFAULT SYSDATE,
    quantity           NUMBER(5) NOT NULL,
    remarks            VARCHAR2(500),

    CONSTRAINT fk_distribution_request
        FOREIGN KEY (request_id)
        REFERENCES blood_request(request_id),

    CONSTRAINT fk_distribution_unit
        FOREIGN KEY (unit_id)
        REFERENCES blood_unit(unit_id),

    CONSTRAINT chk_distribution_quantity
        CHECK (quantity > 0)
);

CREATE TABLE staff (
    staff_id     VARCHAR2(10) PRIMARY KEY,
    first_name   VARCHAR2(50) NOT NULL,
    last_name    VARCHAR2(50) NOT NULL,
    role         VARCHAR2(50) NOT NULL,
    phone        VARCHAR2(15),
    email        VARCHAR2(100),
    status       VARCHAR2(20) DEFAULT 'Active',

    CONSTRAINT chk_staff_status
        CHECK (status IN ('Active', 'Inactive'))
);

CREATE TABLE volunteer (
    volunteer_id  VARCHAR2(10) PRIMARY KEY,
    first_name    VARCHAR2(50) NOT NULL,
    last_name     VARCHAR2(50) NOT NULL,
    phone         VARCHAR2(15),
    email         VARCHAR2(100),
    availability  VARCHAR2(100),
    status        VARCHAR2(20) DEFAULT 'Active',

    CONSTRAINT chk_volunteer_status
        CHECK (status IN ('Active', 'Inactive'))
);

CREATE TABLE camp_assignment (
    assignment_id    VARCHAR2(10) PRIMARY KEY,
    camp_id           VARCHAR2(10) NOT NULL,
    staff_id          VARCHAR2(10),
    volunteer_id      VARCHAR2(10),
    assignment_role   VARCHAR2(100),
    assigned_date     DATE DEFAULT SYSDATE,

    CONSTRAINT fk_assignment_camp
        FOREIGN KEY (camp_id)
        REFERENCES camp(camp_id),

    CONSTRAINT fk_assignment_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id),

    CONSTRAINT fk_assignment_volunteer
        FOREIGN KEY (volunteer_id)
        REFERENCES volunteer(volunteer_id),

    CONSTRAINT chk_assignment_person
        CHECK (
            (staff_id IS NOT NULL AND volunteer_id IS NULL)
            OR
            (staff_id IS NULL AND volunteer_id IS NOT NULL)
        )
);

INSERT INTO venue VALUES
('V001', 'Matara Town Hall', 'Main Street', 'Matara', 500, '0412223344');

INSERT INTO venue VALUES
('V002', 'Kandy Community Centre', 'Peradeniya Road', 'Kandy', 400, '0812234455');

INSERT INTO venue VALUES
('V003', 'Galle Municipal Hall', 'Church Street', 'Galle', 450, '0912235566');

INSERT INTO venue VALUES
('V004', 'Badulla District Hall', 'Lower Street', 'Badulla', 300, '0552236677');

INSERT INTO venue VALUES
('V005', 'Colombo Community Centre', 'Narahenpita Road', 'Colombo', 600, '0112237788');

COMMIT;

INSERT INTO donor VALUES
('D001', 'Kasun', 'Perera', DATE '2002-04-15', 'Male',
 '200212345678', '0771234567', 'kasun@gmail.com',
 'Matara', 'BG01', DATE '2026-01-10', 'Active');

INSERT INTO donor VALUES
('D002', 'Nimal', 'Silva', DATE '1999-08-21', 'Male',
 '199912345679', '0772345678', 'nimal@gmail.com',
 'Galle', 'BG03', DATE '2026-01-12', 'Active');

INSERT INTO donor VALUES
('D003', 'Tharindu', 'Fernando', DATE '2001-11-03', 'Male',
 '200112345680', '0773456789', 'tharindu@gmail.com',
 'Kandy', 'BG05', DATE '2026-01-15', 'Active');

INSERT INTO donor VALUES
('D004', 'Amal', 'Jayasinghe', DATE '1998-02-17', 'Male',
 '199812345681', '0774567890', 'amal@gmail.com',
 'Colombo', 'BG02', DATE '2026-01-20', 'Active');

INSERT INTO donor VALUES
('D005', 'Dilshan', 'Perera', DATE '2000-06-25', 'Male',
 '200012345682', '0775678901', 'dilshan@gmail.com',
 'Matara', 'BG01', DATE '2026-02-01', 'Active');

INSERT INTO donor VALUES
('D006', 'Sahan', 'Wijesinghe', DATE '2003-01-14', 'Male',
 '200312345683', '0776789012', 'sahan@gmail.com',
 'Galle', 'BG04', DATE '2026-02-05', 'Active');

INSERT INTO donor VALUES
('D007', 'Chamod', 'Rathnayake', DATE '2001-09-12', 'Male',
 '200112345684', '0777890123', 'chamod@gmail.com',
 'Kandy', 'BG05', DATE '2026-02-10', 'Active');

INSERT INTO donor VALUES
('D008', 'Isuru', 'Bandara', DATE '1997-12-30', 'Male',
 '199712345685', '0778901234', 'isuru@gmail.com',
 'Badulla', 'BG07', DATE '2026-02-15', 'Active');

INSERT INTO donor VALUES
('D009', 'Ravindu', 'Karunaratne', DATE '2002-03-18', 'Male',
 '200212345686', '0779012345', 'ravindu@gmail.com',
 'Colombo', 'BG08', DATE '2026-02-20', 'Active');

INSERT INTO donor VALUES
('D010', 'Dinesh', 'Gunawardena', DATE '1996-07-09', 'Male',
 '199612345687', '0780123456', 'dinesh@gmail.com',
 'Matara', 'BG03', DATE '2026-03-01', 'Active');

INSERT INTO donor VALUES
('D011', 'Sanduni', 'Perera', DATE '2003-05-11', 'Female',
 '200312345688', '0781234567', 'sanduni@gmail.com',
 'Galle', 'BG01', DATE '2026-03-05', 'Active');

INSERT INTO donor VALUES
('D012', 'Hansika', 'Silva', DATE '2000-10-22', 'Female',
 '200012345689', '0782345678', 'hansika@gmail.com',
 'Kandy', 'BG03', DATE '2026-03-10', 'Active');

INSERT INTO donor VALUES
('D013', 'Sachini', 'Fernando', DATE '2002-01-29', 'Female',
 '200212345690', '0783456789', 'sachini@gmail.com',
 'Colombo', 'BG05', DATE '2026-03-15', 'Active');

INSERT INTO donor VALUES
('D014', 'Thilini', 'Jayawardena', DATE '1999-04-06', 'Female',
 '199912345691', '0784567890', 'thilini@gmail.com',
 'Badulla', 'BG01', DATE '2026-03-20', 'Active');

INSERT INTO donor VALUES
('D015', 'Nadeesha', 'Wickramasinghe', DATE '2001-08-16', 'Female',
 '200112345692', '0785678901', 'nadeesha@gmail.com',
 'Matara', 'BG02', DATE '2026-03-25', 'Active');

INSERT INTO donor VALUES
('D016', 'Madhavi', 'Ranatunga', DATE '1998-11-19', 'Female',
 '199812345693', '0786789012', 'madhavi@gmail.com',
 'Galle', 'BG04', DATE '2026-04-01', 'Active');

INSERT INTO donor VALUES
('D017', 'Piumi', 'Herath', DATE '2003-02-28', 'Female',
 '200312345694', '0787890123', 'piumi@gmail.com',
 'Kandy', 'BG07', DATE '2026-04-05', 'Active');

INSERT INTO donor VALUES
('D018', 'Ayesha', 'De Silva', DATE '2000-09-07', 'Female',
 '200012345695', '0788901234', 'ayesha@gmail.com',
 'Colombo', 'BG08', DATE '2026-04-10', 'Active');

INSERT INTO donor VALUES
('D019', 'Ruwan', 'Madushanka', DATE '1997-06-13', 'Male',
 '199712345696', '0789012345', 'ruwan@gmail.com',
 'Badulla', 'BG06', DATE '2026-04-15', 'Active');

INSERT INTO donor VALUES
('D020', 'Chathura', 'Senanayake', DATE '2001-12-05', 'Male',
 '200112345697', '0790123456', 'chathura@gmail.com',
 'Matara', 'BG01', DATE '2026-04-20', 'Active');

COMMIT;

INSERT INTO donor_health VALUES
('H001', 'D001', 72.5, '120/80', 14.5, 'None', DATE '2026-08-01', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H002', 'D002', 68.0, '118/78', 14.2, 'None', DATE '2026-08-02', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H003', 'D003', 75.0, '122/80', 15.0, 'None', DATE '2026-08-03', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H004', 'D004', 80.0, '125/82', 14.8, 'None', DATE '2026-08-04', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H005', 'D005', 70.0, '119/79', 14.0, 'None', DATE '2026-08-05', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H006', 'D006', 66.0, '121/80', 13.8, 'None', DATE '2026-08-06', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H007', 'D007', 78.0, '123/81', 15.2, 'None', DATE '2026-08-07', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H008', 'D008', 74.0, '117/77', 14.7, 'None', DATE '2026-08-08', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H009', 'D009', 69.0, '120/80', 14.1, 'None', DATE '2026-08-09', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H010', 'D010', 82.0, '128/84', 15.0, 'None', DATE '2026-08-10', 'YES', 'Healthy');

INSERT INTO donor_health VALUES
('H011', 'D011', 58.0, '115/75', 13.5, 'None', DATE '2026-08-11', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H012', 'D012', 62.0, '118/76', 13.8, 'None', DATE '2026-08-12', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H013', 'D013', 60.0, '117/78', 13.9, 'None', DATE '2026-08-13', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H014', 'D014', 64.0, '120/80', 14.3, 'None', DATE '2026-08-14', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H015', 'D015', 57.0, '116/75', 13.2, 'None', DATE '2026-08-15', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H016', 'D016', 61.0, '119/79', 13.7, 'None', DATE '2026-08-16', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H017', 'D017', 59.0, '117/76', 13.6, 'None', DATE '2026-08-17', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H018', 'D018', 63.0, '121/80', 14.0, 'None', DATE '2026-08-18', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H019', 'D019', 76.0, '124/82', 14.6, 'None', DATE '2026-08-19', 'YES', 'Healthy');
INSERT INTO donor_health VALUES
('H020', 'D020', 73.0, '120/80', 14.9, 'None', DATE '2026-08-20', 'YES', 'Healthy');

COMMIT;

SELECT * FROM donor_health;

INSERT INTO camp VALUES
('C001', 'V001', 'Matara New Year Blood Drive',
 DATE '2026-04-10', '08:00', '16:00', 'LifeLine Connect', 'Completed');

INSERT INTO camp VALUES
('C002', 'V002', 'Kandy Community Blood Camp',
 DATE '2026-04-25', '08:30', '16:30', 'LifeLine Connect', 'Completed');

INSERT INTO camp VALUES
('C003', 'V003', 'Galle Blood Donation Day',
 DATE '2026-05-15', '09:00', '17:00', 'LifeLine Connect', 'Completed');

INSERT INTO camp VALUES
('C004', 'V004', 'Badulla Community Donation Camp',
 DATE '2026-06-05', '08:00', '15:00', 'LifeLine Connect', 'Completed');

INSERT INTO camp VALUES
('C005', 'V005', 'Colombo Mega Blood Drive',
 DATE '2026-06-20', '08:00', '17:00', 'LifeLine Connect', 'Completed');

INSERT INTO camp VALUES
('C006', 'V001', 'Matara Emergency Blood Camp',
 DATE '2026-07-10', '08:00', '15:00', 'LifeLine Connect', 'Completed');

INSERT INTO camp VALUES
('C007', 'V003', 'Galle Community Health Camp',
 DATE '2026-08-15', '09:00', '16:00', 'LifeLine Connect', 'Completed');

INSERT INTO camp VALUES
('C008', 'V002', 'Kandy September Blood Drive',
 DATE '2026-09-20', '08:00', '16:00', 'LifeLine Connect', 'Scheduled');

COMMIT;

INSERT INTO donation VALUES
('DN001', 'D001', 'C001', 'H001', DATE '2026-04-10', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN002', 'D002', 'C001', 'H002', DATE '2026-04-10', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN003', 'D003', 'C002', 'H003', DATE '2026-04-25', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN004', 'D004', 'C002', 'H004', DATE '2026-04-25', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN005', 'D005', 'C003', 'H005', DATE '2026-05-15', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN006', 'D006', 'C003', 'H006', DATE '2026-05-15', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN007', 'D007', 'C004', 'H007', DATE '2026-06-05', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN008', 'D008', 'C004', 'H008', DATE '2026-06-05', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN009', 'D009', 'C005', 'H009', DATE '2026-06-20', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN010', 'D010', 'C005', 'H010', DATE '2026-06-20', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN011', 'D011', 'C006', 'H011', DATE '2026-07-10', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN012', 'D012', 'C006', 'H012', DATE '2026-07-10', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN013', 'D013', 'C007', 'H013', DATE '2026-08-15', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN014', 'D014', 'C007', 'H014', DATE '2026-08-15', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN015', 'D015', 'C001', 'H015', DATE '2026-04-10', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN016', 'D016', 'C002', 'H016', DATE '2026-04-25', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN017', 'D017', 'C003', 'H017', DATE '2026-05-15', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN018', 'D018', 'C005', 'H018', DATE '2026-06-20', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN019', 'D019', 'C004', 'H019', DATE '2026-06-05', 450, 'Successful donation');

INSERT INTO donation VALUES
('DN020', 'D020', 'C006', 'H020', DATE '2026-07-10', 450, 'Successful donation');

COMMIT;

INSERT INTO blood_unit VALUES
('BU001', 'DN001', 'BG01', DATE '2026-04-10', DATE '2026-07-09', 'Distributed', 'MAT-01');

INSERT INTO blood_unit VALUES
('BU002', 'DN002', 'BG03', DATE '2026-04-10', DATE '2026-07-09', 'Available', 'MAT-01');

INSERT INTO blood_unit VALUES
('BU003', 'DN003', 'BG05', DATE '2026-04-25', DATE '2026-07-24', 'Distributed', 'KDY-01');

INSERT INTO blood_unit VALUES
('BU004', 'DN004', 'BG02', DATE '2026-04-25', DATE '2026-07-24', 'Available', 'KDY-01');

INSERT INTO blood_unit VALUES
('BU005', 'DN005', 'BG01', DATE '2026-05-15', DATE '2026-08-13', 'Available', 'GAL-01');

INSERT INTO blood_unit VALUES
('BU006', 'DN006', 'BG04', DATE '2026-05-15', DATE '2026-08-13', 'Expired', 'GAL-01');

INSERT INTO blood_unit VALUES
('BU007', 'DN007', 'BG05', DATE '2026-06-05', DATE '2026-09-03', 'Available', 'BAD-01');

INSERT INTO blood_unit VALUES
('BU008', 'DN008', 'BG07', DATE '2026-06-05', DATE '2026-09-03', 'Available', 'BAD-01');

INSERT INTO blood_unit VALUES
('BU009', 'DN009', 'BG08', DATE '2026-06-20', DATE '2026-09-18', 'Available', 'COL-01');

INSERT INTO blood_unit VALUES
('BU010', 'DN010', 'BG03', DATE '2026-06-20', DATE '2026-09-18', 'Distributed', 'COL-01');

INSERT INTO blood_unit VALUES
('BU011', 'DN011', 'BG01', DATE '2026-07-10', DATE '2026-10-08', 'Available', 'MAT-02');

INSERT INTO blood_unit VALUES
('BU012', 'DN012', 'BG03', DATE '2026-07-10', DATE '2026-10-08', 'Available', 'MAT-02');

INSERT INTO blood_unit VALUES
('BU013', 'DN013', 'BG05', DATE '2026-08-15', DATE '2026-11-13', 'Available', 'GAL-02');

INSERT INTO blood_unit VALUES
('BU014', 'DN014', 'BG01', DATE '2026-08-15', DATE '2026-11-13', 'Available', 'GAL-02');

INSERT INTO blood_unit VALUES
('BU015', 'DN015', 'BG02', DATE '2026-04-10', DATE '2026-07-09', 'Distributed', 'MAT-01');

INSERT INTO blood_unit VALUES
('BU016', 'DN016', 'BG04', DATE '2026-04-25', DATE '2026-07-24', 'Available', 'KDY-01');

INSERT INTO blood_unit VALUES
('BU017', 'DN017', 'BG07', DATE '2026-05-15', DATE '2026-08-13', 'Available', 'GAL-01');

INSERT INTO blood_unit VALUES
('BU018', 'DN018', 'BG08', DATE '2026-06-20', DATE '2026-09-18', 'Available', 'COL-01');

INSERT INTO blood_unit VALUES
('BU019', 'DN019', 'BG06', DATE '2026-06-05', DATE '2026-09-03', 'Available', 'BAD-01');

INSERT INTO blood_unit VALUES
('BU020', 'DN020', 'BG01', DATE '2026-07-10', DATE '2026-10-08', 'Available', 'MAT-02');

COMMIT;

INSERT INTO hospital VALUES
('HOSP001', 'Matara District General Hospital',
 'Akuressa Road', 'Matara',
 'Dr. R. Perera', '0412234567', 'matara@hospital.lk');

INSERT INTO hospital VALUES
('HOSP002', 'Teaching Hospital Karapitiya',
 'Hiribura Road', 'Galle',
 'Dr. S. Fernando', '0912234567', 'galle@hospital.lk');

INSERT INTO hospital VALUES
('HOSP003', 'National Hospital Kandy',
 'William Gopallawa Mawatha', 'Kandy',
 'Dr. N. Silva', '0812234567', 'kandy@hospital.lk');

INSERT INTO hospital VALUES
('HOSP004', 'Badulla General Hospital',
 'Mahiyangana Road', 'Badulla',
 'Dr. P. Jayasinghe', '0552234567', 'badulla@hospital.lk');

INSERT INTO hospital VALUES
('HOSP005', 'National Hospital Colombo',
 'Regent Street', 'Colombo',
 'Dr. A. Wijesinghe', '0112234567', 'colombo@hospital.lk');

COMMIT;

INSERT INTO blood_request VALUES
('REQ001', 'HOSP001', 'BG01', DATE '2026-08-20',
 5, 'Urgent', 'Completed', DATE '2026-08-21',
 'Required for emergency patients');

INSERT INTO blood_request VALUES
('REQ002', 'HOSP002', 'BG03', DATE '2026-08-21',
 4, 'Normal', 'Approved', DATE '2026-08-25',
 'Routine blood requirement');

INSERT INTO blood_request VALUES
('REQ003', 'HOSP003', 'BG02', DATE '2026-08-22',
 3, 'Critical', 'Pending', DATE '2026-08-23',
 'Emergency surgery requirement');

INSERT INTO blood_request VALUES
('REQ004', 'HOSP004', 'BG05', DATE '2026-08-23',
 6, 'Urgent', 'Partially Fulfilled', DATE '2026-08-25',
 'Required for patients');

INSERT INTO blood_request VALUES
('REQ005', 'HOSP005', 'BG08', DATE '2026-08-24',
 2, 'Critical', 'Pending', DATE '2026-08-25',
 'Rare blood group requirement');

COMMIT;

INSERT INTO blood_distribution VALUES
('DIST001', 'REQ001', 'BU001', DATE '2026-08-20', 1,
 'Emergency distribution');

INSERT INTO blood_distribution VALUES
('DIST002', 'REQ002', 'BU003', DATE '2026-08-21', 1,
 'Hospital distribution');

INSERT INTO blood_distribution VALUES
('DIST003', 'REQ004', 'BU007', DATE '2026-08-23', 1,
 'Partial fulfillment');

INSERT INTO blood_distribution VALUES
('DIST004', 'REQ001', 'BU015', DATE '2026-08-20', 1,
 'Emergency distribution');

COMMIT;

INSERT INTO staff VALUES
('S001', 'Ruwan', 'Perera', 'Camp Coordinator',
 '0711234567', 'ruwan@lifeline.lk', 'Active');

INSERT INTO staff VALUES
('S002', 'Nadeesha', 'Silva', 'Medical Officer',
 '0712345678', 'nadeesha@lifeline.lk', 'Active');

INSERT INTO staff VALUES
('S003', 'Chamara', 'Fernando', 'Nurse',
 '0713456789', 'chamara@lifeline.lk', 'Active');

INSERT INTO staff VALUES
('S004', 'Dilki', 'Jayawardena', 'Blood Bank Officer',
 '0714567890', 'dilki@lifeline.lk', 'Active');

INSERT INTO staff VALUES
('S005', 'Tharushi', 'Perera', 'Administrator',
 '0715678901', 'tharushi@lifeline.lk', 'Active');

COMMIT;


INSERT INTO volunteer VALUES
('VOL001', 'Kasun', 'Wijaya', '0751234567',
 'kasunv@gmail.com', 'Weekends', 'Active');

INSERT INTO volunteer VALUES
('VOL002', 'Sithmi', 'Fernando', '0752345678',
 'sithmi@gmail.com', 'Weekdays', 'Active');

INSERT INTO volunteer VALUES
('VOL003', 'Ravindu', 'Silva', '0753456789',
 'ravindu@gmail.com', 'Weekends', 'Active');

INSERT INTO volunteer VALUES
('VOL004', 'Hiruni', 'Perera', '0754567890',
 'hiruni@gmail.com', 'Flexible', 'Active');

INSERT INTO volunteer VALUES
('VOL005', 'Yasiru', 'Bandara', '0755678901',
 'yasiru@gmail.com', 'Weekends', 'Active');

COMMIT;

INSERT INTO camp_assignment VALUES
('A001', 'C001', 'S001', NULL, 'Camp Coordinator', DATE '2026-04-01');

INSERT INTO camp_assignment VALUES
('A002', 'C001', 'S002', NULL, 'Medical Officer', DATE '2026-04-01');

INSERT INTO camp_assignment VALUES
('A003', 'C001', NULL, 'VOL001', 'Registration Support', DATE '2026-04-01');

INSERT INTO camp_assignment VALUES
('A004', 'C002', 'S003', NULL, 'Nurse', DATE '2026-04-15');

INSERT INTO camp_assignment VALUES
('A005', 'C002', NULL, 'VOL002', 'Donor Assistance', DATE '2026-04-15');

INSERT INTO camp_assignment VALUES
('A006', 'C003', 'S004', NULL, 'Blood Bank Officer', DATE '2026-05-01');

INSERT INTO camp_assignment VALUES
('A007', 'C003', NULL, 'VOL003', 'Registration Support', DATE '2026-05-01');

INSERT INTO camp_assignment VALUES
('A008', 'C004', 'S001', NULL, 'Camp Coordinator', DATE '2026-05-20');

INSERT INTO camp_assignment VALUES
('A009', 'C004', NULL, 'VOL004', 'Donor Assistance', DATE '2026-05-20');

INSERT INTO camp_assignment VALUES
('A010', 'C005', 'S005', NULL, 'Administrator', DATE '2026-06-10');

INSERT INTO camp_assignment VALUES
('A011', 'C005', NULL, 'VOL005', 'Registration Support', DATE '2026-06-10');

COMMIT;

UPDATE blood_unit
SET status = 'Expired'
WHERE expiry_date < TRUNC(SYSDATE)
AND status = 'Available';

COMMIT;

SELECT unit_id, blood_group_id, collection_date, expiry_date, status
FROM blood_unit
ORDER BY unit_id;
