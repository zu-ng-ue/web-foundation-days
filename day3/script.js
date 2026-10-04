// Starting Data
let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "finish day 3 assignment", category: "work" },
    { id: 3, text: "email the project report to Grace", category: "work" },
    { id: 4, text: "revise javascript arrays", category: "study" },
    { id: 5, text: "call mum", category: "personal" },

];

// 1. Search notes
function searchNotes(word) {
    return notes.filter(n => n.text.toLowerCase().includes(word.toLowerCase()));
}
// 2. Find longest note
function longestNote() {
    return notes.length ? notes.reduce((a, b) =>
        b.text.length > a.text.length ? b : a) : null;
}
// 3. Count categories
function CountByCategory() {
    return notes.reduce((c, n) => {
        c[n.category] = (c[n.category] || 0) + 1;
        return c;
    }, {});
}
// 4. Summary
function getSummary() {
    let c = CountByCategory();
    return '${notes.length} ${notes.length==1? "note" : "notes"}: ' +
        Object.entries(c).map(([K, v]) => '${v} ${k}').join(",");
}

// 5. Check duplicate
function isDuplicate(text) {
    text = text.trim().toLowerCase();
    return notes.some(n =>
        n.text.trim().toLowerCase() === text);
}
// 6. Add note
function addNote(text, category) {
    text = text.trim();
    if (!text || text.length > 200) return false;
    if (!["personal", "work",
        "study"].includes(category)) return false;
    if (isDuplicate(text)) return false;
    notes.push({
        id: notes.length ? notes[notes.length - 1].id + 1 : 1,
        text,
        category
    });
    return true;
}

// Tests
console.log(searchNotes("milk"));
console.log(longestNote());
console.log(CountByCategory());
console.log(getSummary());
console.log(isDuplicate(" BUY MILK AND BREAD "));
console.log(addNote("Study for exams", study));
console.log(addNote("Buy milk and bread", "personal"));
console.log(addNote("", "work"));
console.log(addNote("New note", "hobby"));
