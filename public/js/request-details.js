const params =
    new URLSearchParams(window.location.search);

const requestId =
    params.get('id');


// Load request details

async function loadRequestDetails() {

    if (!requestId) {

        alert(
            'Request ID was not provided.'
        );

        window.location.href =
            'requests.html';

        return;
    }


    try {

        await loadRequest();

        await loadDistributions();

    } catch (error) {

        console.error(error);

        alert(
            'Failed to load request details.'
        );

    }

}


// Load request

async function loadRequest() {

    const response =
        await fetch(
            `/api/requests/${requestId}`
        );


    const request =
        await response.json();


    if (!response.ok) {

        throw new Error(
            request.error ||
            'Failed to load request'
        );

    }


    document.getElementById(
        'requestTitle'
    ).textContent =
        request.hospital_name;


    document.getElementById(
        'requestSubtitle'
    ).textContent =
        `${request.blood_group} blood request`;


    document.getElementById(
        'requestId'
    ).textContent =
        request.request_id;


    document.getElementById(
        'bloodGroup'
    ).textContent =
        request.blood_group;


    document.getElementById(
        'quantityRequired'
    ).textContent =
        request.quantity_required;


    document.getElementById(
        'urgency'
    ).textContent =
        request.urgency;


    document.getElementById(
        'requestStatus'
    ).textContent =
        request.status;


    document.getElementById(
        'requestDate'
    ).textContent =
        formatDate(
            request.request_date
        );


    document.getElementById(
        'requiredDate'
    ).textContent =
        formatDate(
            request.required_date
        );


    document.getElementById(
        'remarks'
    ).textContent =
        request.remarks || '-';


    document.getElementById(
        'hospitalId'
    ).textContent =
        request.hospital_id;


    document.getElementById(
        'hospitalName'
    ).textContent =
        request.hospital_name;


    document.getElementById(
        'hospitalAddress'
    ).textContent =
        request.address;


    document.getElementById(
        'hospitalCity'
    ).textContent =
        request.city;


    document.getElementById(
        'contactPerson'
    ).textContent =
        request.contact_person || '-';


    document.getElementById(
        'hospitalPhone'
    ).textContent =
        request.phone || '-';

}


// Load distributions

async function loadDistributions() {

    const response =
        await fetch(
            `/api/requests/${requestId}/distributions`
        );


    const distributions =
        await response.json();


    if (!response.ok) {

        throw new Error(
            distributions.error ||
            'Failed to load distributions'
        );

    }


    const tbody =
        document.getElementById(
            'distributionTableBody'
        );


    tbody.innerHTML = '';


    if (distributions.length === 0) {

        tbody.innerHTML = `
            <tr>

                <td colspan="6">
                    No blood units have been
                    distributed for this request.
                </td>

            </tr>
        `;

        return;
    }


    distributions.forEach(distribution => {

        const row =
            document.createElement('tr');


        row.innerHTML = `

            <td>
                ${distribution.distribution_id}
            </td>

            <td>
                ${distribution.unit_id}
            </td>

            <td>
                ${distribution.blood_group}
            </td>

            <td>
                ${formatDate(
                    distribution.distribution_date
                )}
            </td>

            <td>
                ${distribution.quantity}
            </td>

            <td>
                ${distribution.remarks || '-'}
            </td>

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


// Back

function goBack() {

    window.location.href =
        'requests.html';

}


// Start

loadRequestDetails();