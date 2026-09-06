let allUnits = [];


// Load inventory

async function loadInventory() {

    try {

        const response =
            await fetch('/api/inventory');

        if (!response.ok) {
            throw new Error('Failed to load inventory');
        }

        allUnits = await response.json();

        displayInventory(allUnits);

        calculateStatistics(allUnits);

        await loadSummary();

    } catch (error) {

        console.error(error);

        document.getElementById(
            'inventoryTableBody'
        ).innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load inventory.
                </td>
            </tr>
        `;

    }

}


// Load summary

async function loadSummary() {

    const response =
        await fetch('/api/inventory/summary');

    const summary =
        await response.json();


    const tbody =
        document.getElementById(
            'summaryTableBody'
        );

    tbody.innerHTML = '';


    summary.forEach(item => {

        const row =
            document.createElement('tr');

        row.innerHTML = `

            <td>
                <strong>
                    ${item.blood_group}
                </strong>
            </td>

            <td>
                ${item.total_units}
            </td>

            <td>
                ${item.available_units}
            </td>

            <td>
                ${item.reserved_units}
            </td>

            <td>
                ${item.distributed_units}
            </td>

            <td>
                ${item.expired_units}
            </td>

        `;

        tbody.appendChild(row);

    });

}


// Display units

function displayInventory(units) {

    const tbody =
        document.getElementById(
            'inventoryTableBody'
        );

    tbody.innerHTML = '';


    if (units.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No blood units found.
                </td>
            </tr>
        `;

        return;
    }


    units.forEach(unit => {

        const row =
            document.createElement('tr');


        row.innerHTML = `

            <td>
                ${unit.unit_id}
            </td>

            <td>
                ${unit.donation_id}
            </td>

            <td>
                <strong>
                    ${unit.blood_group}
                </strong>
            </td>

            <td>
                ${formatDate(unit.collection_date)}
            </td>

            <td>
                ${formatDate(unit.expiry_date)}
            </td>

            <td>

                <span class="status
                    ${getStatusClass(unit.status)}">

                    ${unit.status}

                </span>

            </td>

            <td>
                ${unit.storage_location || '-'}
            </td>

        `;


        tbody.appendChild(row);

    });

}


// Calculate statistics

function calculateStatistics(units) {

    let available = 0;
    let reserved = 0;
    let expired = 0;


    units.forEach(unit => {

        if (unit.status === 'Available') {
            available++;
        }

        if (unit.status === 'Reserved') {
            reserved++;
        }

        if (
            unit.status === 'Expired' ||
            new Date(unit.expiry_date) < new Date()
        ) {
            expired++;
        }

    });


    document.getElementById(
        'totalUnits'
    ).textContent = units.length;


    document.getElementById(
        'availableUnits'
    ).textContent = available;


    document.getElementById(
        'reservedUnits'
    ).textContent = reserved;


    document.getElementById(
        'expiredUnits'
    ).textContent = expired;

}


// Search

function filterInventory() {

    const search =
        document.getElementById(
            'inventorySearch'
        ).value.toLowerCase();


    const filtered =
        allUnits.filter(unit => {

            return (

                unit.unit_id
                    .toLowerCase()
                    .includes(search)

                ||

                unit.donation_id
                    .toLowerCase()
                    .includes(search)

                ||

                unit.blood_group
                    .toLowerCase()
                    .includes(search)

                ||

                unit.status
                    .toLowerCase()
                    .includes(search)

            );

        });


    displayInventory(filtered);

}


// Update expired units

async function updateExpiredUnits() {

    try {

        const response =
            await fetch(
                '/api/inventory/update-expired',
                {
                    method: 'POST'
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                'Failed to update expired units'
            );

        }


        alert(data.message);


        loadInventory();

    } catch (error) {

        console.error(error);

        alert(
            'Failed to update expired units.'
        );

    }

}


// Format date

function formatDate(dateValue) {

    if (!dateValue) {
        return '-';
    }

    return new Date(dateValue)
        .toLocaleDateString();

}


// Status style

function getStatusClass(status) {

    if (status === 'Available') {
        return 'status-scheduled';
    }

    if (status === 'Distributed') {
        return 'status-completed';
    }

    if (status === 'Expired') {
        return 'status-cancelled';
    }

    return '';

}


// Start

loadInventory();