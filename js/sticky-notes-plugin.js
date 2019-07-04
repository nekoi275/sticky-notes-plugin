function StickyNotes(addNoteButton, workspaceParams) {
    var noteId;
    var maxZIndex;
    var activeNote;

    init();
    
    this.createNote = function(noteStatus) {
        if (!noteStatus.id) {
            noteStatus.id = ++noteId;
        } else {
            removeNote(noteStatus.id);
        }

        if (!noteStatus.Z) {
            noteStatus.Z = ++maxZIndex;
        };

        createNoteElement(noteStatus);
        localStorageSaveNote(noteStatus);
    };

    function createNoteElement(noteStatus) {
        var note = document.createElement('div');
    
        note.classList.add('note');
        note.setAttribute('data-note-id', noteStatus.id);
        note.innerHTML = '<a class="note-move-button"></a>' +
                         '<a class="note-remove-button"></a>' +
                         '<div class="note-textarea">' +
                           '<textarea></textarea>' +
                         '</div>';
    
        document.body.appendChild(note);
        setNoteHandlers(note);
        note.getElementsByTagName('textarea')[0].value = noteStatus.text;
    
        note.style.left = noteStatus.X;
        note.style.top = noteStatus.Y;
        note.style.zIndex = noteStatus.Z;
    
        return note;
    };

    function setNoteHandlers(note) {
        note.addEventListener('mousedown', function(event) {
            if (event.target.className === 'note-move-button') {
                activeNote = note;
            };
    
            if (note.style.zIndex < maxZIndex) {
                note.style.zIndex = ++maxZIndex;
            };
        });
    
        var removeButton = note.getElementsByClassName('note-remove-button')[0]
        removeButton.addEventListener('click', function() {
            removeNote(+note.getAttribute('data-note-id') );
        });
    
        var textArea = note.getElementsByTagName('textarea')[0]
        textArea.addEventListener('blur', function() {
            var noteStatus = getNoteStatus(note);
            localStorageSaveNote(noteStatus);
        });
    };

    function getNoteStatus(noteElem) {
        var noteStatus = {};
        noteStatus.id = +noteElem.getAttribute('data-note-id');
        noteStatus.text = noteElem.getElementsByTagName('textarea')[0].value;
        noteStatus.Z = +noteElem.style.zIndex;
        noteStatus.X = noteElem.style.left;
        noteStatus.Y = noteElem.style.top;
        return noteStatus;
    };

    function removeNote(noteId) {
        var note = document.body.querySelector('[data-note-id="' + noteId + '"]');
        if (note) {
            document.body.removeChild(note);
            localStorageRemoveNote(noteId);
        };
    };
    
    function localStorageSaveNote(noteStatus) {
        var notes = localStorageGetNotes();
        var index = notes.findIndex( function(elem) {return elem.id === noteStatus.id} );
    
        if (index >= 0) {
            notes.splice(index, 1, noteStatus);
        } else {
            notes.push(noteStatus);
        }
    
        localStorage.setItem('notes', JSON.stringify(notes) );
    };
    
    function localStorageRemoveNote(noteId) {
        var notes = localStorageGetNotes();
        var index = notes.findIndex( function(elem) {return elem.id === noteId} );
        if (index >= 0) {
            notes.splice(index, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
        };
    };
    
    function localStorageGetNotes() {
        var notes = localStorage.getItem('notes');
        if (notes) {
            return JSON.parse(notes);
        } else {
            localStorage.setItem('notes', '[]');
            return [];
        };
    };
    
    function loadNotes() {
        var notes = localStorageGetNotes();
        notes.forEach( function(note) {createNoteElement(note);} );
        maxZIndex = notes.reduce( function(accumulator, value) {
            return (accumulator < value.Z) ? value.Z : accumulator
        }, 0);
        noteId = notes.reduce( function(accumulator, value) {
            return (accumulator < value.id) ? value.id : accumulator
        }, 0);
    };

    function init() {
        loadNotes();

        document.addEventListener('mousemove', function(event) {
            if (activeNote) {
                document.body.style.cssText = 'overflow: hidden;' +
                                            '-moz-user-select: none;' +
                                            ' -webkit-user-select: none;' + 
                                            ' user-select: none';

                if (event.clientX >= (document.documentElement.clientWidth - 30) ) {
                    activeNote.style.left = (document.documentElement.clientWidth - 30) + 'px';
                } else {
                    activeNote.style.left = event.clientX + 'px';
                };

                if (event.clientY >= (document.documentElement.clientHeight - 30) ) {
                    activeNote.style.top = (document.documentElement.clientHeight - 30) + 'px';
                } else if (event.clientY <= 0) {
                    activeNote.style.top = 0 + 'px';
                } else {
                    activeNote.style.top = event.clientY + 'px';
                };
            };
        });

        document.addEventListener('mouseup', function() {
            if (activeNote) {
                var noteStatus = getNoteStatus(activeNote);
                localStorageSaveNote(noteStatus);
                activeNote = null;
                document.body.style.cssText = 'overflow: visible;' +
                                            '-moz-user-select: auto;' +
                                            ' -webkit-user-select: auto;' + 
                                            ' user-select: auto';
            };
        });

        if (addNoteButton) {
            addNoteButton.addEventListener('click', function() {
            var note = createNoteElement({id: ++noteId, Z: ++maxZIndex, text: ''});
            var noteStatus = getNoteStatus(note);
            localStorageSaveNote(noteStatus);
            });
        };
    };
}

