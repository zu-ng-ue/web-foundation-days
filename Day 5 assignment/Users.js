// 1. Select DOM elements
const loadUsersBtn = document.getElementById('load-users');
const filterInput = document.getElementById('filter-input');
const statusP = document.getElementById('status');
const usersList = document.getElementById('users-list');

// 2. Store fetched users in a global array
let allUsers = [];

// 3. Async function to fetch users
async function loadUsers() {
    // Disable button and show loading status
    loadUsersBtn.disabled = true;
    statusP.textContent = "Loading...";
    usersList.innerHTML = ''; // Clear previous results

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        allUsers = data; // Store the data in our array
        
        statusP.textContent = "Users loaded successfully!";
        renderUsers(allUsers); // Render the full list
    } catch (error) {
        console.error("Fetch error:", error);
        statusP.textContent = "Error loading users. Please try again later.";
    } finally {
        // Re-enable button regardless of success or failure
        loadUsersBtn.disabled = false;
    }
}

// 4. Function to render the users array
function renderUsers(list) {
    // Clear the current list
    while (usersList.firstChild) {
        usersList.removeChild(usersList.firstChild);
    }

    // Handle empty state (e.g., no matches from filter)
    if (list.length === 0) {
        const li = document.createElement('li');
        li.textContent = "No users match your filter.";
        li.style.listStyle = 'none';
        li.style.color = '#777';
        usersList.appendChild(li);
        return;
    }

    // Loop through the list and create elements
    list.forEach(user => {
        const li = document.createElement('li');
        
        // Create elements for user details
        const nameEl = document.createElement('h3');
        nameEl.textContent = user.name;
        
        const emailEl = document.createElement('p');
        emailEl.textContent = `Email: ${user.email}`;
        
        const cityEl = document.createElement('p');
        cityEl.textContent = `City: ${user.address.city}`;
        
        const companyEl = document.createElement('p');
        companyEl.textContent = `Company: ${user.company.name}`;

        // Append details to the list item
        li.appendChild(nameEl);
        li.appendChild(emailEl);
        li.appendChild(cityEl);
        li.appendChild(companyEl);

        // Add styling to make it look like a card
        li.style.border = "1px solid #ccc";
        li.style.padding = "1rem";
        li.style.marginBottom = "1rem";
        li.style.borderRadius = "5px";
        li.style.listStyle = "none";

        // Append the list item to the main list
        usersList.appendChild(li);
    });
}

// 5. Event Listeners
loadUsersBtn.addEventListener('click', loadUsers);

// Filter input listener
filterInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    // Filter the existing array without making a new request
    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm)
    );
    
    renderUsers(filteredUsers);
});
