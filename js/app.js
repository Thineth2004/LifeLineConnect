async function loadDashboard() {

    try {

        const response = await fetch('/api/dashboard');

        const data = await response.json();


        document.getElementById('totalDonors').textContent =
            data.totalDonors;

        document.getElementById('availableUnits').textContent =
            data.availableUnits;

        document.getElementById('upcomingCamps').textContent =
            data.upcomingCamps;

        document.getElementById('pendingRequests').textContent =
            data.pendingRequests;


    } catch (error) {

        console.error(
            'Failed to load dashboard:',
            error
        );

    }

}


loadDashboard();