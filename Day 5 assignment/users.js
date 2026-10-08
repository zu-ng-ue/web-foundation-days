const loadUsersBtn = document.getElementById('load-users');
const filterInput = document.getElementById('filter-input');
const statusP = document.getElementById('status');
const usersList = document.getElementById('users-list');

let allUsers = [];

async function loadUsers() {
    loadUsersBtn.disabled = true;
    statusP.textContent = "Loading...";
    usersList.innerHTML = '';

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        allUsers = data;
        statusP.textContent = "Users loaded successfully!";
        renderUsers(allUsers);
    } catch (error) {
        console.error("Fetch error:", error);
        statusP.textContent = "Error loading users. Please try again later.";
    } finally {
        loadUsersBtn.disabled = false;
    }
}

function renderUsers(list) {
    while (usersList.firstChild) usersList.removeChild(usersList.firstChild);

    if (list.length === 0) {
        const li = document.createElement('li');
        li.textContent = "No users match your filter.";
        li.style.listStyle = 'none';
        li.style.color = '#777';
        usersList.appendChild(li);
        return;
    }

    list.forEach(user => {
        const li = document.createElement('li');
        const nameEl = document.createElement('h3');
        nameEl.textContent = user.name;
        const emailEl = document.createElement('p');
        emailEl.textContent = `Email: ${user.email}`;
        const cityEl = document.createElement('p');
        cityEl.textContent = `City: ${user.address.city}`;
        const companyEl = document.createElement('p');
        companyEl.textContent = `Company: ${user.company.name}`;

        li.appendChild(nameEl); li.appendChild(emailEl); li.appendChild(cityEl); li.appendChild(companyEl);
        li.style.border = "1px solid #ccc"; li.style.padding = "1rem"; li.style.marginBottom = "1rem"; li.style.borderRadius = "5px"; li.style.listStyle = "none";
        usersList.appendChild(li);
    });
}

loadUsersBtn.addEventListener('click', loadUsers);
filterInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredUsers = allUsers.filter(user => user.name.toLowerCase().includes(searchTerm));
    renderUsers(filteredUsers);
});
