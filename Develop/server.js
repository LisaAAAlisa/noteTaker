// Dependencies
// =============================================================
const express = require("express");
const path = require("path");
const fs = require("fs");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 3001;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Basic route that sends the user first to the AJAX Page
app.get("/", function(req, res) {
  // res.send("Welcome to the Star Wars Page!")
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Displays all characters
app.get("/notes", function(req, res) {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});
app.get("/api/notes", function(req, res) {
    res.sendFile(path.join(__dirname, "db/db.json"));
});


app.post("/api/notes", function (req, res) {
    // req.body hosts is equal to the JSON post sent from the user
    // This works because of our body parsing middleware
    const newNote = req.body;
    const rawdata = fs.readFileSync(path.resolve(__dirname, 'db/db.json'), function (err) {
        if (err) throw err;
    });
    const notes = JSON.parse(rawdata);    
    // The first note may not have an id so give it one.
    if(notes.length === 1 && notes[0].id === undefined){
        notes[0].id = 0;
    }
    // If there are no notes, set the id to 0, otherwise sort the ids, get the max and increment it
    // for the new id.
    if(notes.length === 0) {
        newNote.id = 0;  
    } else {
        const ids = notes.map(note => note.id);
        const sorted = ids.sort((a, b) => a - b);
        newNote.id = sorted[sorted.length - 1] + 1;
    }
    notes.push(newNote);
    fs.writeFile(path.resolve(__dirname, 'db/db.json'), JSON.stringify(notes), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    res.json(newNote);
});

app.delete("/api/notes/:id", (req, res) => {
    const noteId = req.params.id;
    const rawdata = fs.readFileSync(path.resolve(__dirname, 'db/db.json'), function (err) {
        if (err) throw err;
    });
    var notes = JSON.parse(rawdata);
    const noteIdIndex = notes.findIndex(n => n.id == noteId);
    notes.splice(noteIdIndex, 1);
    fs.writeFile(path.resolve(__dirname, 'db/db.json'), JSON.stringify(notes), function (err) {
        if (err) throw err;
    });
    res.send("Note " + noteId + " deleted");
});




// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});
