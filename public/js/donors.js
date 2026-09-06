let allDonors = [];

document
    .getElementById('donorForm')
    .addEventListener('submit', async function(event) {

        event.preventDefault();


        const donor = {

            donor_id:
                document.getElementById('donorId').value,

            first_name:
                document.getElementById('firstName').value,

            last_name:
                document.getElementById('lastName').value,

            date_of_birth:
                document.getElementById('dateOfBirth').value,

            gender:
                document.getElementById('gender').value,

            nic:
                document.getElementById('nic').value,

            phone:
                document.getElementById('phone').value,

            email:
                document.getElementById('email').value,

            address:
                document.getElementById('address').value,

            blood_group_id:
                document.getElementById('bloodGroup').value

        };


        try {

            const response = await fetch(
                '/api/donors',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify(donor)
                }
            );


            const result = await response.json();


            if (!response.ok) {

                alert(
                    result.error ||
                    'Failed to register donor'
                );

                return;

            }


            alert(
                'Donor registered successfully!'
            );


            closeDonorForm();

            document
                .getElementById('donorForm')
                .reset();

            loadDonors();


        } catch (error) {

            console.error(error);

            alert(
                'Unable to connect to server.'
            );

        }

    });

// Load donors
async function loadDonors() {

    try {

        const response = await fetch('/api/donors');

        allDonors = await response.json();

        displayDonors(allDonors);

    } catch (error) {

        console.error(
            'Failed to load donors:',
            error
        );

    }

}


// Display donors
function displayDonors(donors) {

    const table = document.getElementById('donorTable');

    table.innerHTML = '';


    donors.forEach(donor => {

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${donor.donor_id}</td>

            <td>
                ${donor.first_name}
                ${donor.last_name}
            </td>

            <td>
                ${donor.blood_group}
            </td>

            <td>
                ${donor.phone || '-'}
            </td>

            <td>
                ${donor.status}
            </td>

            <td>

                <button
                    class="primary-button"
                    onclick="viewDonor('${donor.donor_id}')">

                    View

                </button>

            </td>
        `;

        table.appendChild(row);

    });

}


// Search
function filterDonors() {

    const search =
        document
            .getElementById('searchDonor')
            .value
            .toLowerCase();


    const filtered = allDonors.filter(donor => {

        const name =
            `${donor.first_name} ${donor.last_name}`
                .toLowerCase();

        return (
            donor.donor_id.toLowerCase().includes(search) ||
            name.includes(search) ||
            donor.blood_group.toLowerCase().includes(search)
        );

    });


    displayDonors(filtered);

}


// Open modal
function openDonorForm() {

    document.getElementById(
        'donorModal'
    ).style.display = 'flex';

}


// Close modal
function closeDonorForm() {

    document.getElementById(
        'donorModal'
    ).style.display = 'none';

}


// View donor
function viewDonor(id) {

    window.location.href =
        `donor-details.html?id=${id}`;

}


loadDonors();