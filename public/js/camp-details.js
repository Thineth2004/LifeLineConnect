const params = new URLSearchParams(window.location.search);

const campId = params.get('id');


// Load everything

async function loadCampDetails() {

    if (!campId) {

        alert('Camp ID was not provided.');

        window.location.href = 'camps.html';

        return;
    }


    try {

        await loadCamp();

        await loadAssignments();

        await loadDonations();

    } catch (error) {

        console.error(error);

        alert('Failed to load camp details.');

    }

}


// Load camp information

async function loadCamp() {

    const response =
        await fetch(`/api/camps/${campId}`);

    const camp = await response.json();


    if (!response.ok) {

        throw new Error(
            camp.error || 'Failed to load camp'
        );

    }


    document.getElementById('campTitle').textContent =
        camp.camp_name;

    document.getElementById('campSubtitle').textContent =
        `${camp.venue_name} - ${camp.city}`;


    document.getElementById('campId').textContent =
        camp.camp_id;

    document.getElementById('campName').textContent =
        camp.camp_name;

    document.getElementById('campDate').textContent =
        formatDate(camp.camp_date);

    document.getElementById('startTime').textContent =
        camp.start_time || '-';

    document.getElementById('endTime').textContent =
        camp.end_time || '-';

    document.getElementById('organizer').textContent =
        camp.organizer || '-';

    document.getElementById('campStatus').textContent =
        camp.status;


    document.getElementById('venueId').textContent =
        camp.venue_id;

    document.getElementById('venueName').textContent =
        camp.venue_name;

    document.getElementById('venueAddress').textContent =
        camp.address;

    document.getElementById('venueCity').textContent =
        camp.city;

    document.getElementById('venueCapacity').textContent =
        camp.capacity || '-';

    document.getElementById('venueContact').textContent =
        camp.contact_number || '-';

}


// Load assignments

async function loadAssignments() {

    const response =
        await fetch(`/api/camps/${campId}/assignments`);

    const assignments = await response.json();


    if (!response.ok) {

        throw new Error(
            assignments.error ||
            'Failed to load assignments'
        );

    }


    const tbody =
        document.getElementById('assignmentTableBody');

    tbody.innerHTML = '';


    if (assignments.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    No staff or volunteers assigned.
                </td>
            </tr>
        `;

        return;
    }


    assignments.forEach(assignment => {

        const row = document.createElement('tr');


        let personName;
        let personType;


        if (assignment.staff_id) {

            personName =
                assignment.staff_name;

            personType =
                'Staff';

        } else {

            personName =
                assignment.volunteer_name;

            personType =
                'Volunteer';

        }


        row.innerHTML = `
            <td>${assignment.assignment_id}</td>

            <td>${personName || '-'}</td>

            <td>${personType}</td>

            <td>${assignment.assignment_role || '-'}</td>
        `;


        tbody.appendChild(row);

    });

}


// Load donations

async function loadDonations() {

    const response =
        await fetch(`/api/camps/${campId}/donations`);

    const donations = await response.json();


    if (!response.ok) {

        throw new Error(
            donations.error ||
            'Failed to load donations'
        );

    }


    const tbody =
        document.getElementById('donationTableBody');

    tbody.innerHTML = '';


    if (donations.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    No donations recorded for this camp.
                </td>
            </tr>
        `;

        return;
    }


    donations.forEach(donation => {

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${donation.donation_id}</td>

            <td>${donation.donor_id}</td>

            <td>${donation.donor_name}</td>

            <td>${donation.blood_group}</td>

            <td>${formatDate(donation.donation_date)}</td>

            <td>${donation.quantity_ml} ml</td>
        `;


        tbody.appendChild(row);

    });

}


// Format date

function formatDate(dateValue) {

    if (!dateValue) {
        return '-';
    }

    return new Date(dateValue)
        .toLocaleDateString();

}


// Back button

function goBack() {

    window.location.href =
        'camps.html';

}


// Start

loadCampDetails();