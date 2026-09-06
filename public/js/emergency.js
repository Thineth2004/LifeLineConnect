let allAppeals = [];
let selectedAppealId = null;


// Load all appeals
async function loadAppeals() {

    try {

        const response =
            await fetch('/api/emergency');

        allAppeals = await response.json();

        displayAppeals(allAppeals);

        calculateStatistics(allAppeals);

    } catch (error) {

        console.error(
            'Failed to load emergency appeals:',
            error
        );

    }
}


// Display appeals
function displayAppeals(appeals) {

    const table =
        document.getElementById('appealsTable');

    table.innerHTML = '';


    appeals.forEach(appeal => {

        const row =
            document.createElement('tr');


        row.innerHTML = `
            <td>${appeal.appeal_id}</td>

            <td>${appeal.title}</td>

            <td>${appeal.blood_group}</td>

            <td>${appeal.hospital_name}</td>

            <td>
                <span class="status ${getUrgencyClass(appeal.urgency)}">
                    ${appeal.urgency}
                </span>
            </td>

            <td>${appeal.required_units}</td>

            <td>${appeal.current_units}</td>

            <td>${appeal.status}</td>

            <td>
                <button
                    class="btn-small"
                    onclick="viewAppeal('${appeal.appeal_id}')"
                >
                    View
                </button>
            </td>
        `;


        table.appendChild(row);

    });
}


// Urgency CSS class
function getUrgencyClass(urgency) {

    if (urgency === 'Critical') {
        return 'status-cancelled';
    }

    if (urgency === 'Urgent') {
        return 'status-scheduled';
    }

    return 'status-completed';
}


// Calculate statistics
function calculateStatistics(appeals) {

    const active =
        appeals.filter(
            appeal => appeal.status === 'Active'
        ).length;


    const critical =
        appeals.filter(
            appeal => appeal.urgency === 'Critical'
        ).length;


    const required =
        appeals.reduce(
            (total, appeal) =>
                total + Number(appeal.required_units || 0),
            0
        );


    document.getElementById('activeAppeals')
        .textContent = active;

    document.getElementById('criticalAppeals')
        .textContent = critical;

    document.getElementById('unitsRequired')
        .textContent = required;
}


// Search
async function searchAppeals() {

    const keyword =
        document.getElementById('emergencySearch')
            .value
            .trim();


    if (!keyword) {

        loadAppeals();

        return;
    }


    try {

        const response =
            await fetch(
                `/api/emergency/search?keyword=${encodeURIComponent(keyword)}`
            );


        const results =
            await response.json();


        displayAppeals(results);

    } catch (error) {

        console.error(
            'Failed to search:',
            error
        );

    }
}


// View appeal
async function viewAppeal(appealId) {

    try {

        const response =
            await fetch(
                `/api/emergency/${appealId}`
            );


        const appeal =
            await response.json();


        selectedAppealId =
            appeal.appeal_id;


        document.getElementById('appealDetails')
            .style.display = 'block';


        document.getElementById('detailTitle')
            .textContent = appeal.title;


        document.getElementById('appealInformation')
            .innerHTML = `
                <p>
                    <strong>Blood Group:</strong>
                    ${appeal.blood_group}
                </p>

                <p>
                    <strong>Hospital:</strong>
                    ${appeal.hospital_name}
                </p>

                <p>
                    <strong>Urgency:</strong>
                    ${appeal.urgency}
                </p>

                <p>
                    <strong>Required Units:</strong>
                    ${appeal.required_units}
                </p>

                <p>
                    <strong>Current Units:</strong>
                    ${appeal.current_units}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${appeal.status}
                </p>
            `;


        document.getElementById('detailMessage')
            .textContent = appeal.message;


        displayDiscussion(
            appeal.discussion || []
        );


        document.getElementById('appealDetails')
            .scrollIntoView({
                behavior: 'smooth'
            });

    } catch (error) {

        console.error(
            'Failed to load appeal:',
            error
        );

    }
}


// Display discussion
function displayDiscussion(messages) {

    const list =
        document.getElementById('discussionList');

    list.innerHTML = '';


    if (messages.length === 0) {

        list.innerHTML =
            '<p>No discussion messages yet.</p>';

        return;
    }


    messages.forEach(item => {

        const div =
            document.createElement('div');

        div.className = 'panel';


        div.innerHTML = `
            <strong>${item.user_id}</strong>

            <p>${item.message}</p>

            <small>
                ${formatDate(item.created_at)}
            </small>
        `;


        list.appendChild(div);

    });
}


// Add discussion message
async function addDiscussion() {

    if (!selectedAppealId) {

        alert('Please select an appeal first.');

        return;
    }


    const userId =
        document.getElementById('discussionUser')
            .value
            .trim();


    const message =
        document.getElementById('discussionMessage')
            .value
            .trim();


    if (!userId || !message) {

        alert('Please enter user ID and message.');

        return;
    }


    try {

        const response =
            await fetch(
                `/api/emergency/${selectedAppealId}/discussion`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        user_id: userId,
                        message: message
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(result.error);

            return;
        }


        document.getElementById('discussionMessage')
            .value = '';


        await viewAppeal(selectedAppealId);


    } catch (error) {

        console.error(error);

        alert('Failed to add discussion message.');

    }
}


// Format date
function formatDate(dateString) {

    if (!dateString) {
        return '-';
    }

    return new Date(dateString)
        .toLocaleString();
}


// Start
loadAppeals();