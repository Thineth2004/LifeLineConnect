async function loadDashboard() {

    try {

        const response = await fetch('/api/dashboard');

        const data = await response.json();


        // Main statistics

        document.getElementById('totalDonors').textContent =
            data.totalDonors;

        document.getElementById('availableUnits').textContent =
            data.availableUnits;

        document.getElementById('upcomingCamps').textContent =
            data.upcomingCamps;

        document.getElementById('pendingRequests').textContent =
            data.pendingRequests;


        // Dashboard sections

        displayInventory(data.inventory);

        displayUpcomingCamps(data.upcomingCampsList);

        displayRecentRequests(data.recentRequests);


    } catch (error) {

        console.error(
            'Failed to load dashboard:',
            error
        );

    }
}


// Display blood inventory
function displayInventory(inventory) {

    const container =
        document.getElementById('inventorySummary');


    if (!container) {
        return;
    }


    if (inventory.length === 0) {

        container.innerHTML =
            '<p>No blood inventory available.</p>';

        return;
    }


    let html = `
        <table>

            <thead>
                <tr>
                    <th>Blood Group</th>
                    <th>Available Units</th>
                </tr>
            </thead>

            <tbody>
    `;


    inventory.forEach(item => {

        html += `
            <tr>
                <td>${item.blood_group}</td>
                <td>${item.total_units}</td>
            </tr>
        `;

    });


    html += `
            </tbody>

        </table>
    `;


    container.innerHTML = html;
}


// Display upcoming camps
function displayUpcomingCamps(camps) {

    const container =
        document.getElementById('campSummary');


    if (!container) {
        return;
    }


    if (camps.length === 0) {

        container.innerHTML =
            '<p>No upcoming camps.</p>';

        return;
    }


    let html = `
        <table>

            <thead>
                <tr>
                    <th>Camp</th>
                    <th>Date</th>
                    <th>Venue</th>
                </tr>
            </thead>

            <tbody>
    `;


    camps.forEach(camp => {

        html += `
            <tr>
                <td>${camp.camp_name}</td>
                <td>${formatDate(camp.camp_date)}</td>
                <td>${camp.venue_name}</td>
            </tr>
        `;

    });


    html += `
            </tbody>

        </table>
    `;


    container.innerHTML = html;
}


// Display recent hospital requests
function displayRecentRequests(requests) {

    const container =
        document.getElementById('requestSummary');


    if (!container) {
        return;
    }


    if (requests.length === 0) {

        container.innerHTML =
            '<p>No hospital requests.</p>';

        return;
    }


    let html = `
        <table>

            <thead>
                <tr>
                    <th>Request</th>
                    <th>Hospital</th>
                    <th>Blood Group</th>
                    <th>Units</th>
                    <th>Urgency</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>
    `;


    requests.forEach(request => {

        html += `
            <tr>

                <td>${request.request_id}</td>

                <td>${request.hospital_name}</td>

                <td>${request.blood_group}</td>

                <td>${request.quantity_required}</td>

                <td>
                    <span class="status ${getUrgencyClass(request.urgency)}">
                        ${request.urgency}
                    </span>
                </td>

                <td>${request.status}</td>

            </tr>
        `;

    });


    html += `
            </tbody>

        </table>
    `;


    container.innerHTML = html;
}


// Urgency styling
function getUrgencyClass(urgency) {

    if (urgency === 'Critical') {
        return 'status-cancelled';
    }

    if (urgency === 'Urgent') {
        return 'status-scheduled';
    }

    return 'status-completed';
}


// Format date
function formatDate(dateString) {

    if (!dateString) {
        return '-';
    }

    return new Date(dateString)
        .toLocaleDateString();

}


// Load dashboard
loadDashboard();