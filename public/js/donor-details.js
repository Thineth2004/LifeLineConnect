const params = new URLSearchParams(window.location.search);
const donorId = params.get('id');


async function loadDonorDetails() {

    if (!donorId) {
        alert('Donor ID was not provided.');
        window.location.href = 'donors.html';
        return;
    }

    try {

        const donorResponse =
            await fetch(`/api/donors/${donorId}`);

        const donor = await donorResponse.json();

        if (!donorResponse.ok) {
            throw new Error(donor.error);
        }

        displayDonor(donor);


        const healthResponse =
            await fetch(`/api/donors/${donorId}/health`);

        const healthRecords = await healthResponse.json();

        displayHealthRecords(healthRecords);


        const donationResponse =
            await fetch(`/api/donors/${donorId}/donations`);

        const donations = await donationResponse.json();

        displayDonationHistory(donations);


        const eligibilityResponse =
            await fetch(`/api/donors/${donorId}/eligibility`);

        const eligibilityData =
            await eligibilityResponse.json();

        displayEligibility(eligibilityData.eligibility);

    } catch (error) {

        console.error(error);

        alert('Failed to load donor details.');

    }
}


function displayDonor(donor) {

    document.getElementById('donorId').textContent =
        donor.donor_id;

    document.getElementById('donorName').textContent =
        `${donor.first_name} ${donor.last_name}`;

    document.getElementById('dateOfBirth').textContent =
        formatDate(donor.date_of_birth);

    document.getElementById('gender').textContent =
        donor.gender || '-';

    document.getElementById('nic').textContent =
        donor.nic;

    document.getElementById('phone').textContent =
        donor.phone || '-';

    document.getElementById('email').textContent =
        donor.email || '-';

    document.getElementById('bloodGroup').textContent =
        donor.blood_group;

    document.getElementById('donorStatus').textContent =
        donor.status;

    document.getElementById('registrationDate').textContent =
        formatDate(donor.registration_date);
}


function displayEligibility(eligibility) {

    const element =
        document.getElementById('eligibility');

    element.textContent = eligibility;

}


function displayHealthRecords(records) {

    const tbody =
        document.getElementById('healthTableBody');

    tbody.innerHTML = '';


    if (!records || records.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No health records found.
                </td>
            </tr>
        `;

        return;
    }


    records.forEach(record => {

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${formatDate(record.LAST_CHECK_DATE)}</td>
            <td>${record.WEIGHT || '-'}</td>
            <td>${record.BLOOD_PRESSURE || '-'}</td>
            <td>${record.HEMOGLOBIN || '-'}</td>
            <td>${record.MEDICAL_CONDITIONS || '-'}</td>
            <td>${record.ELIGIBLE}</td>
            <td>${record.REMARKS || '-'}</td>
        `;

        tbody.appendChild(row);

    });

}


function displayDonationHistory(donations) {

    const tbody =
        document.getElementById('donationTableBody');

    tbody.innerHTML = '';


    if (!donations || donations.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    No donation history found.
                </td>
            </tr>
        `;

        return;
    }


    donations.forEach(donation => {

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${donation.DONATION_ID}</td>
            <td>${formatDate(donation.DONATION_DATE)}</td>
            <td>${donation.CAMP_NAME}</td>
            <td>${donation.VENUE_NAME}</td>
            <td>${donation.QUANTITY_ML} ml</td>
            <td>${donation.REMARKS || '-'}</td>
        `;

        tbody.appendChild(row);

    });

}


function formatDate(dateValue) {

    if (!dateValue) {
        return '-';
    }

    return new Date(dateValue).toLocaleDateString();

}


function goBack() {

    window.location.href = 'donors.html';

}


loadDonorDetails();