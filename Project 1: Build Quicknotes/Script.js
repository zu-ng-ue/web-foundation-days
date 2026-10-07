// 1. Select DOM elements using querySelector
const noteForm = document.querySelector('#note-form');
const noteInput = document.querySelector('#note-input');
const noteCategory = document.querySelector('#note-category');
const errorMessage = document.querySelector('#error-message');
const notesList = document.querySelector('#notes-list');
const noteCount = document.querySelector('#note-count');
const searchInput = document.querySelector('#search-input');
const clearAllBtn = document.querySelector('#clear-all-btn');

// 2. Notes array
let notes = [];
let currentSearchTerm = '';

// 3. Load notes from localStorage on page load
function loadNotes() {
    const storedNotes = localStorage.getItem('quicknotes-data');
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    }
    render();
}

// 4. Save notes to localStorage
function saveNotes() {
    localStorage.setItem('quicknotes-data', JSON.stringify(notes));
}

// 5. Render function (creates elements dynamically, no innerHTML for user text)
function render() {
    // Clear the list
    while (notesList.firstChild) {
        notesList.removeChild(notesList.firstChild);
    }

    // Filter notes based on search term
    const filteredNotes = notes.filter(note => 
        note.text.toLowerCase().includes(currentSearchTerm.toLowerCase())
    );

    // Handle empty states
    if (filteredNotes.length === 0) {
        if (currentSearchTerm !== '') {
            const li = document.createElement('li');
            li.textContent = "No notes match your search.";
            li.style.listStyle = 'none';
            li.style.color = '#777';
            notesList.appendChild(li);
        }
    }

    // Loop through notes and create cards
    filteredNotes.forEach(note => {
        const li = document.createElement('li');
        li.className = `note-card category-${note.category}`;
        
        // Content wrapper
        const contentDiv = document.createElement('div');
        contentDiv.className = 'note-content';

        // Note text
        const textP = document.createElement('p');
        textP.className = 'note-text';
        textP.textContent = note.text; // using textContent, not innerHTML

        // Meta info (Category and Date)
        const metaDiv = document.createElement('div');
        metaDiv.className = 'note-meta';
        
        const catSpan = document.createElement('span');
        catSpan.className = 'category-label';
        catSpan.textContent = note.category;
        
        const dateSpan = document.createElement('span');
        dateSpan.textContent = note.createdAt;

        metaDiv.appendChild(catSpan);
        metaDiv.appendChild(dateSpan);
        contentDiv.appendChild(textP);
        contentDiv.appendChild(metaDiv);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteNote(note.id));

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        notesList.appendChild(li);
    });

    updateCount();
}

// 6. Update the count message
function updateCount() {
    const count = notes.length;
    if (count === 0) {
        noteCount.textContent = "You have no notes yet.";
    } else if (count === 1) {
        noteCount.textContent = "You have 1 note.";
    } else {
        noteCount.textContent = `You have ${count} notes.`;
    }
}

// 7. Handle form submission (Add note)
noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = noteInput.value.trim();
    
    // Validation
    if (text === '') {
        errorMessage.textContent = "Please type a note first.";
        return;
    }
    if (text.length > 200) {
        errorMessage.textContent = "Notes must be 200 characters or fewer.";
        return;
    }

    // Clear error
    errorMessage.textContent = '';

    // Create note object
    const newNote = {
        id: Date.now(), // simple unique ID
        text: text,
        category: noteCategory.value,
        createdAt: new Date().toLocaleString()
    };

    // Add to array, save, clear input, render
    notes.push(newNote);
    saveNotes();
    noteInput.value = '';
    render();
});

// 8. Delete a note
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    render();
}

// 9. Search functionality
searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value;
    render();
});

// 10. Bonus: Clear all with confirmation
clearAllBtn.addEventListener('click', () => {
    if (notes.length === 0) return;
    
    const confirmDelete = confirm("Delete all notes?");
    if (confirmDelete) {
        notes = [];
        saveNotes();
        render();
    }
});

// Initialization
loadNotes();
