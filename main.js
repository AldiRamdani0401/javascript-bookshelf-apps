const books = [];
const RENDER_EVENT = 'render-book';
const SEARCH_EVENT = 'search-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

// function generatedId() {
//     return + new Date();
// }

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id: parseInt(id),
        title: title.toString(),
        author: author.toString(),
        year: parseInt(year),
        isComplete: isComplete
    };
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function isStorageExist() {
    if (typeof (Storage) === undefined ){
        return false;
    }
    return true;
}

function saveBookData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);

    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBookElement (bookObject) {
    const {id, title, author, year, isComplete} = bookObject;

    const bookContainerItem = document.createElement('article');
    bookContainerItem.classList.add('book_item');
    bookContainerItem.setAttribute('id', `book-${id}`);

    const bookTitle = document.createElement('h2');
    bookTitle.innerText = title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = "Penulis : " + author;

    const bookYear = document.createElement('p');
    bookYear.innerText = "Tahun : " + year;

    const bookActionContainer = document.createElement('div');
    bookActionContainer.classList.add('action');

    bookContainerItem.append(bookTitle, bookAuthor, bookYear, bookActionContainer);

    if (isComplete) {

        const moveBookToIncompletedBtn = document.createElement('button');
        moveBookToIncompletedBtn.classList.add('orange');
        moveBookToIncompletedBtn.innerText = 'Belum Selesai Di Baca';

        const updateBookBtn = document.createElement('button');
        updateBookBtn.classList.add('yellow');
        updateBookBtn.innerText = 'Edit Data Buku';

        const deleteBookBtn = document.createElement('button');
        deleteBookBtn.classList.add('red');
        deleteBookBtn.innerText = 'Hapus Buku';

        moveBookToIncompletedBtn.addEventListener('click', () => {
            moveBookToIncompeleted(id);
        });

        updateBookBtn.addEventListener('click', () => {
            updateBookDataSelected(bookObject);
        });

        deleteBookBtn.addEventListener('click', () => {
            confirmDelete = confirm('Apakah anda yakin akan menghapus buku ini?');
            if (confirmDelete) {
                deleteBookDataSelected(id);
            }
        });

        bookActionContainer.append(moveBookToIncompletedBtn, updateBookBtn, deleteBookBtn);
    } else {
        const moveBookToCompletedBtn = document.createElement('button');
        moveBookToCompletedBtn.classList.add('green');
        moveBookToCompletedBtn.innerText = 'Selesai Di Baca';

        const updateBookBtn = document.createElement('button');
        updateBookBtn.classList.add('yellow');
        updateBookBtn.innerText = 'Edit Data Buku';

        const deleteBookBtn = document.createElement('button');
        deleteBookBtn.classList.add('red');
        deleteBookBtn.innerText = 'Hapus Buku';

        moveBookToCompletedBtn.addEventListener('click', () => {
            moveBookToCompleted(id);
        });

        updateBookBtn.addEventListener('click', () => {
            updateBookDataSelected(bookObject);
        });

        deleteBookBtn.addEventListener('click', () => {
            confirmDelete = confirm('Apakah anda yakin akan menghapus buku ini?');
            if (confirmDelete) {
                deleteBookDataSelected(id);
                alert('Data Buku Berhasil Di Hapus');
            }
        });

        bookActionContainer.append(moveBookToCompletedBtn, updateBookBtn, deleteBookBtn);
    }

    return bookContainerItem;
}

function addBook() {
    const bookTitleValue = document.getElementById('inputBookTitle').value;
    const bookAuthorValue = document.getElementById('inputBookAuthor').value;
    const bookYearValue = document.getElementById('inputBookYear').value;
    const bookIscompleteElement = document.getElementById('inputBookIsComplete');
    const bookIscompleteValue = bookIscompleteElement.checked;

    const isBookExists = books.some(book => book.title === bookTitleValue && book.author === bookAuthorValue);

    if (isBookExists) {
        alert(`Buku dengan judul : ${bookTitleValue}, dengan penulis : ${bookAuthorValue} sudah ada!`);
        return;
    }

    const generatedID = generatedId();
    const bookObject = generateBookObject(generatedID, bookTitleValue, bookAuthorValue, bookYearValue, bookIscompleteValue);
    books.push(bookObject);

    saveBookData();
    alert('Data Buku Baru Berhasil Ditambahkan');
    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, () => {
    console.log('Data berhasil di simpan kedalam Storage.');
});

function searchBookByTitle(searchTitleData) {
    let bookFound = false;

    if (searchTitleData) {
        for (const book of books) {
            if (book.title === searchTitleData) {
                document.dispatchEvent(new CustomEvent(SEARCH_EVENT, {detail: book}));
                bookFound = true;
                break;
            }
        }
        if (!bookFound) {
            alert(`Buku dengan judul : ${searchTitleData} tidak ditemukan!`);
            document.dispatchEvent(new CustomEvent(SEARCH_EVENT, {detail: null}));
        }
    } else {
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function moveBookToCompleted(bookId) {
    const bookSelected = findBook(bookId);

    if (bookSelected == null) return;

    bookSelected.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();
}

function moveBookToIncompeleted(bookId) {
    const bookSelected = findBook(bookId);

    if (bookSelected === null) return;

    bookSelected.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();
}

function updateBookDataSelected(bookData) {
    const mainElement = document.querySelector('main');

    const formEditBookData = document.createElement('form');
    formEditBookData.setAttribute('id', 'formEditBookData');
    formEditBookData.style.zIndex = '1000';

    const inputElementID = document.createElement('input');
    inputElementID.type = 'hidden';
    inputElementID.name = 'bookId';
    inputElementID.value = bookData.id;

    const labelTitle = document.createElement('label');
    labelTitle.textContent = 'Judul Buku:';
    const inputTitle = document.createElement('input');
    inputTitle.type = 'text';
    inputTitle.name = 'bookTitle';
    inputTitle.value = bookData.title;
    inputTitle.required = true;

    const labelAuthor = document.createElement('label');
    labelAuthor.textContent = 'Penulis Buku:';
    const inputAuthor = document.createElement('input');
    inputAuthor.type = 'text';
    inputAuthor.name = 'bookAuthor';
    inputAuthor.value = bookData.author;
    inputAuthor.required = true;

    const labelYear = document.createElement('label');
    labelYear.textContent = 'Tahun Buku:';
    const inputYear = document.createElement('input');
    inputYear.type = 'number';
    inputYear.name = 'bookYear';
    inputYear.value = bookData.year;
    inputYear.required = true;

    const submitButton = document.createElement('button');
    submitButton.setAttribute('id', 'btnEditUpdate')
    submitButton.type = 'submit';
    submitButton.textContent = 'Update Book Data';

    const closeButton = document.createElement('button');
    closeButton.setAttribute('id', 'btnEditClose');
    closeButton.type = 'button';
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        mainElement.removeChild(formEditBookData);
    });

    formEditBookData.addEventListener('submit', function(event) {
        event.preventDefault();
        const bookIndex = findBookIndex(bookData.id);

        if (bookIndex !== -1) {
            const inputDataTitle = inputTitle.value;
            const inputDataAuthor = inputAuthor.value;
            const inputDataYear = inputYear.value;

            const generateBookData = generateBookObject(bookData.id, inputDataTitle, inputDataAuthor, inputDataYear);

            books[bookIndex].title = generateBookData.title;
            books[bookIndex].author = generateBookData.author;
            books[bookIndex].year = generateBookData.year;

            saveBookData();

            alert('Data Buku Berhasil Di Perbarui');
            document.dispatchEvent(new Event(RENDER_EVENT));
            mainElement.removeChild(formEditBookData);
        }

    });

    formEditBookData.append(inputElementID, labelTitle, inputTitle, labelAuthor, inputAuthor, labelYear, inputYear, submitButton, closeButton);

    mainElement.append(formEditBookData);
}

function deleteBookDataSelected(bookId) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveBookData();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const submitSearchBook = document.getElementById('searchBook');
    submitSearchBook.addEventListener('submit', (event) => {
        event.preventDefault();
        const searchBookTitleValue = document.getElementById('searchBookTitle').value;
        searchBookByTitle(searchBookTitleValue);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, () => {
    const incompletedBookContainer = document.getElementById('incompleteBookshelfList');
    const completedBookContainer = document.getElementById('completeBookshelfList');

    incompletedBookContainer.innerHTML = '';
    completedBookContainer.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBookElement(bookItem);

        if (bookItem.isComplete) {
            completedBookContainer.append(bookElement);
        } else {
            incompletedBookContainer.append(bookElement);
        }
    }
});

document.addEventListener(SEARCH_EVENT, (event) => {
    const incompletedBookContainer = document.getElementById('incompleteBookshelfList');
    const completedBookContainer = document.getElementById('completeBookshelfList');

    incompletedBookContainer.innerHTML = '';
    completedBookContainer.innerHTML = '';

    if (event.detail) {
        for (const bookItem of books) {
            if (bookItem.title === event.detail.title) {
                const bookElement = makeBookElement(bookItem);
                if (bookItem.isComplete) {
                    completedBookContainer.append(bookElement);
                } else {
                    incompletedBookContainer.append(bookElement);
                }
                bookFound = true;
            }
        }
    } else {
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
});

// function generatedId() {
//     return 1;
// }

dummyData = {
    id: 1,
    title: 'Buku',
    author: 'Aldi',
    year:   2020,
    isComplete: null
}

function pushDummyData() {
    for (index = 1; index <= 20; index++) {
        let dataGenerated;
        if (index % 2 == 0) {
            dataGenerated = generateBookObject(
                dummyData.id + index + 10, dummyData.title + index, dummyData.author + index, dummyData.year, true
            );
            books.push(dataGenerated);
        } else {
            dataGenerated = generateBookObject(
                dummyData.id + index + 20, dummyData.title + index, dummyData.author + index, dummyData.year, false
            );
            books.push(dataGenerated);
        }
    }
    saveBookData();
}
// pushDummyData();

function clearStorage() {
    localStorage.clear();
    console.log(localStorage);
}

// clearStorage();

console.log(books);