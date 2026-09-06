let allRequests = [];


// Load requests

async function loadRequests() {

    try {

        const response =
            await fetch('/api/requests');

        if (!response.ok) {
            throw new Error(
                'Failed to load requests'
            );
        }

        allRequests =
            await response.json();


        displayRequests(allRequests);

        updateStatistics(allRequests);

    } catch (error) {

        console.error(error);

        document.getElementById(
            'requestTableBody'
        ).innerHTML = `
            <tr>
                <td colspan="8">
                    Failed to load hospital requests.
                </td>
            </tr>
        `;

    }

}


// Display requests

function displayRequests(requests) {

    const tbody =
        document.getElementById(
            'requestTableBody'
        );

    tbody.innerHTML = '';


    if (requests.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    No hospital requests found.
                </td>
            </tr>
        `;

        return;
    }


    requests.forEach(request => {

        const row =
            document.createElement('tr');


        row.innerHTML = `

            <td>
                ${request.request_id}
            </td>

            <td>
                <strong>
                    ${request.hospital_name}
                </strong>
            </td>

            <td>
                ${request.blood_group}
            </td>

            <td>
                ${request.quantity_required}
            </td>

            <td>

                <span class="status
                    ${getUrgencyClass(request.urgency)}">

                    ${request.urgency}

                </span>

            </td>

            <td>

                <span class="status
                    ${getRequestStatusClass(request.status)}">

                    ${request.status}

                </span>

            </td>

            <td>
                ${formatDate(request.required_date)}
            </td>

            <td>

                <button
                    class="btn-small"
                    onclick="viewRequest('${request.request_id}')">

                    View

                </button>

            </td>

        `;


        tbody.appendChild(row);

    });

}


// Statistics

function updateStatistics(requests) {

    const total =
        requests.length;


    const pending =
        requests.filter(
            r => r.status === 'Pending'
        ).length;


    const urgent =
        requests.filter(
            r =>
                r.urgency === 'Urgent' ||
                r.urgency === 'Critical'
        ).length;


    const completed =
        requests.filter(
            r => r.status === 'Completed'
        ).length;


    document.getElementById(
        'totalRequests'
    ).textContent = total;


    document.getElementById(
        'pendingRequests'
    ).textContent = pending;


    document.getElementById(
        'urgentRequests'
    ).textContent = urgent;


    document.getElementById(
        'completedRequests'
    ).textContent = completed;

}


// Search

function filterRequests() {

    const search =
        document.getElementById(
            'requestSearch'
        )
        .value
        .toLowerCase();


    const filtered =
        allRequests.filter(request => {

            return (

                request.request_id
                    .toLowerCase()
                    .includes(search)

                ||

                request.hospital_name
                    .toLowerCase()
                    .includes(search)

                ||

                request.blood_group
                    .toLowerCase()
                    .includes(search)

                ||

                request.urgency
                    .toLowerCase()
                    .includes(search)

                ||

                request.status
                    .toLowerCase()
                    .includes(search)

            );

        });


    displayRequests(filtered);

}


// View request

function viewRequest(requestId) {

    window.location.href =
        `request-details.html?id=${requestId}`;

}


// Date

function formatDate(dateValue) {

    if (!dateValue) {
        return '-';
    }

    return new Date(dateValue)
        .toLocaleDateString();

}


// Urgency style

function getUrgencyClass(urgency) {

    if (urgency === 'Critical') {
        return 'status-cancelled';
    }

    if (urgency === 'Urgent') {
        return 'status-completed';
    }

    return 'status-scheduled';

}


// Request status style

function getRequestStatusClass(status) {

    if (status === 'Completed') {
        return 'status-completed';
    }

    if (status === 'Rejected') {
        return 'status-cancelled';
    }

    return 'status-scheduled';

}


// Start

loadRequests();