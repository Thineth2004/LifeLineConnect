let allCamps = [];


// Load camps from Oracle API

async function loadCamps() {

    try {

        const response = await fetch('/api/camps');

        if (!response.ok) {
            throw new Error('Failed to load camps');
        }

        allCamps = await response.json();

        displayCamps(allCamps);

        updateCampStatistics(allCamps);

    } catch (error) {

        console.error(error);

        document.getElementById('campTableBody').innerHTML = `
            <tr>
                <td colspan="9">
                    Failed to load camps.
                </td>
            </tr>
        `;

    }

}


// Display camps

function displayCamps(camps) {

    const tbody =
        document.getElementById('campTableBody');

    tbody.innerHTML = '';


    if (camps.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9">
                    No camps found.
                </td>
            </tr>
        `;

        return;
    }


    camps.forEach(camp => {

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${camp.camp_id}</td>

            <td>
                <strong>${camp.camp_name}</strong>
            </td>

            <td>
                ${formatDate(camp.camp_date)}
            </td>

            <td>
                ${camp.start_time || '-'}
                -
                ${camp.end_time || '-'}
            </td>

            <td>
                ${camp.venue_name}
            </td>

            <td>
                ${camp.city}
            </td>

            <td>
                ${camp.organizer || '-'}
            </td>

            <td>
                <span class="status ${getStatusClass(camp.status)}">
                    ${camp.status}
                </span>
            </td>

            <td>
                <button
                    class="btn-small"
                    onclick="viewCamp('${camp.camp_id}')">
                    View
                </button>
            </td>
        `;

        tbody.appendChild(row);

    });

}


// Camp statistics

function updateCampStatistics(camps) {

    document.getElementById('totalCamps').textContent =
        camps.length;


    const upcoming =
        camps.filter(camp =>
            camp.status === 'Scheduled'
        ).length;

    const completed =
        camps.filter(camp =>
            camp.status === 'Completed'
        ).length;

    const cancelled =
        camps.filter(camp =>
            camp.status === 'Cancelled'
        ).length;


    document.getElementById('upcomingCamps').textContent =
        upcoming;

    document.getElementById('completedCamps').textContent =
        completed;

    document.getElementById('cancelledCamps').textContent =
        cancelled;

}


// Search camps

function filterCamps() {

    const search =
        document.getElementById('campSearch')
            .value
            .toLowerCase();


    const filtered =
        allCamps.filter(camp => {

            return (
                camp.camp_id.toLowerCase().includes(search) ||
                camp.camp_name.toLowerCase().includes(search) ||
                camp.venue_name.toLowerCase().includes(search) ||
                camp.city.toLowerCase().includes(search)
            );

        });


    displayCamps(filtered);

}


// View camp

function viewCamp(campId) {

    window.location.href =
        `camp-details.html?id=${campId}`;

}


// Format date

function formatDate(dateValue) {

    if (!dateValue) {
        return '-';
    }

    return new Date(dateValue)
        .toLocaleDateString();

}


// Status class

function getStatusClass(status) {

    if (status === 'Scheduled') {
        return 'status-scheduled';
    }

    if (status === 'Completed') {
        return 'status-completed';
    }

    if (status === 'Cancelled') {
        return 'status-cancelled';
    }

    return '';

}


// Start

loadCamps();