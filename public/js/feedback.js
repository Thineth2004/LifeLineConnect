let allFeedback = [];


// Load feedback
async function loadFeedback() {

    try {

        const response = await fetch('/api/feedback');

        allFeedback = await response.json();

        displayFeedback(allFeedback);

        calculateStatistics(allFeedback);

    } catch (error) {

        console.error('Failed to load feedback:', error);

    }
}


// Display feedback
function displayFeedback(feedback) {

    const table = document.getElementById('feedbackTable');

    table.innerHTML = '';


    feedback.forEach(item => {

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${item.feedback_id}</td>
            <td>${item.camp_id}</td>
            <td>${item.venue_id}</td>
            <td>${'★'.repeat(item.rating)}</td>
            <td>${item.title || '-'}</td>
            <td>${item.comment || '-'}</td>
            <td>${item.feedback_type || '-'}</td>
        `;

        table.appendChild(row);

    });
}


// Calculate statistics
function calculateStatistics(feedback) {

    document.getElementById('totalFeedback').textContent =
        feedback.length;


    if (feedback.length === 0) {

        document.getElementById('averageRating').textContent = '0.0';

        return;
    }


    const totalRating = feedback.reduce(
        (sum, item) => sum + Number(item.rating),
        0
    );


    const average = totalRating / feedback.length;


    document.getElementById('averageRating').textContent =
        average.toFixed(1);
}


// Load top-rated camps
async function loadTopRatedCamps() {

    try {

        const response = await fetch('/api/feedback/top-rated');

        const camps = await response.json();

        const table = document.getElementById('topRatedTable');

        table.innerHTML = '';


        camps.forEach(camp => {

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${camp._id}</td>
                <td>${Number(camp.average_rating).toFixed(1)} ★</td>
                <td>${camp.total_reviews}</td>
            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error('Failed to load top-rated camps:', error);

    }
}


// Search feedback
function filterFeedback() {

    const search =
        document.getElementById('feedbackSearch')
            .value
            .toLowerCase();


    const filtered = allFeedback.filter(item => {

        return (
            item.feedback_id?.toLowerCase().includes(search) ||
            item.camp_id?.toLowerCase().includes(search) ||
            item.venue_id?.toLowerCase().includes(search) ||
            item.title?.toLowerCase().includes(search) ||
            item.comment?.toLowerCase().includes(search)
        );

    });


    displayFeedback(filtered);
}


// Start
loadFeedback();
loadTopRatedCamps();