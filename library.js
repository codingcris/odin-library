const LIBRARY = [];

const book = {
  init(title, author, pages, read) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
    return this;
  },
  info() {
    return `${this.name} by ${this.author}, ${this.pages} pages. ${
      this.read ? "Read." : "Not read yet."
    }`;
  },
};

function Book() {
  const b = Object.create(book);
  b.init(...arguments);
  return b;
}

// Add a book to the library and display it
function addBookToLibrary(book) {
  LIBRARY.push(book);
  let bookIndex = LIBRARY.length - 1;
  let bookCard = createBookCard(book);
  bookCard.setAttribute("data-book-index", bookIndex);
  displayBook(bookCard);
}

// Create a book card element
function createBookCard(book) {
  let bookCard = document.createElement("div");
  bookCard.classList.add("bookCard");

  let bookTitle = document.createElement("h2");
  bookTitle.style.margin = "0";
  bookTitle.textContent = book.title;
  bookTitle.style.maxWidth = "90%";
  bookTitle.style.height = "60%";
  bookTitle.style.lineHeight = "1.2";
  bookTitle.classList.add("bookTitle");

  let bookAuthor = document.createElement("h3");
  bookAuthor.textContent = "By\n" + book.author;
  bookAuthor.style.maxWidth = "90%";
  bookAuthor.style.margin = "0";
  bookAuthor.classList.add("bookAuthor");

  bookCard.appendChild(bookTitle);
  bookCard.appendChild(bookAuthor);

  bookCard.style.padding = "0.5rem";
  bookCard.style.backgroundColor = "#ffdaab";
  bookCard.style.height = "100%";
  bookCard.style.width = "100%";
  bookCard.style.textAlign = "center";
  bookCard.style.position = "relative";

  return bookCard;
}

// Display a book card
function displayBook(bookCard) {
  let book = LIBRARY[bookCard.getAttribute("data-book-index")];
  if (book.displayed) return;

  let bookDisplay = document.getElementById("myBooks");
  let bookOptions = createBookOptions(book);
  bookCard.appendChild(bookOptions);
  bookDisplay.appendChild(bookCard);
  book.displayed = true;
}

// Create book options (Delete, Info, Read)
function createBookOptions(book) {
  let bookOptions = document.createElement("div");
  bookOptions.classList.add("bookOptions");

  let remove = document.createElement("button");
  remove.textContent = "Delete";
  remove.addEventListener("click", removeBook);

  let info = document.createElement("button");
  info.textContent = "Info";
  info.addEventListener("click", bookInfo);

  let read = document.createElement("input");
  read.type = "checkbox";
  if (book.read) {
    read.checked = true;
  }
  read.addEventListener("change", bookRead);

  bookOptions.appendChild(remove);
  bookOptions.appendChild(info);
  bookOptions.appendChild(read);

  return bookOptions;
}

// Remove a book from the library
function removeBook(event) {
  let button = event.target;
  let bookCard = button.parentNode.parentNode;
  let bookIndex = Number(bookCard.getAttribute("data-book-index"));
  let bookDisplay = document.getElementById("myBooks");
  let cards = Array.from(bookDisplay.children);

  // Decrease the index of all bookCards that come after the deleted book
  for (let book of cards.slice(bookIndex + 1)) {
    let oldIdx = Number(book.getAttribute("data-book-index"));
    book.setAttribute("data-book-index", --oldIdx);
  }

  // remove book from LIBRARY and its bookCard from the bookDisplay
  LIBRARY.splice(bookIndex, 1);
  bookDisplay.children[bookIndex].remove();
}

// Show the new book form
function showForm() {
  let form = document.getElementById("newBookForm");
  let overlay = document.getElementById("dim-overlay");
  overlay.style.visibility = "visible";
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "1rem";
  form.style.visibility = "visible";
}

// Cancel and hide the new book form
function cancelForm() {
  let form = document.getElementById("newBookForm");
  form.style.display = "none";
  let overlay = document.getElementById("dim-overlay");
  overlay.style.visibility = "hidden";
}

// Submit a new book
function submitBook(event) {
  event.preventDefault();
  let title = document.getElementById("title").value;
  let author = document.getElementById("author").value;
  let pages = document.getElementById("pages").value;
  let read = document.getElementById("read").checked;
  let book = Book(title, author, pages, read);
  let form = document.getElementById("newBookForm");
  form.reset();
  addBookToLibrary(book);
  cancelForm();
}

// Display book information
function bookInfo(event) {
  let button = event.target;
  let bookCard = button.parentNode.parentNode;
  let bookIndex = Number(bookCard.getAttribute("data-book-index"));
  let book = LIBRARY[bookIndex];

  // Dim the app with overlay
  let overlay = document.getElementById("dim-overlay");
  overlay.style.visibility = "visible";

  // Bring book Info to the front
  let infoDisplay = document.getElementById("infoDisplay");
  infoDisplay.style.visibility = "visible";

  let titleDisplay = document.getElementById("titleInfo");
  titleDisplay.textContent = book.title;

  let authorDisplay = document.getElementById("authorInfo");
  authorDisplay.textContent = book.author;

  let pagesDisplay = document.getElementById("pagesInfo");
  pagesDisplay.textContent = book.pages;

  let readDisplay = document.getElementById("readInfo");
  readDisplay.textContent = book.read;
}

// Close the book information display
function closeInfo() {
  let overlay = document.getElementById("dim-overlay");
  overlay.style.visibility = "hidden";
  let infoDisplay = document.getElementById("infoDisplay");
  infoDisplay.style.visibility = "hidden";
}

// Toggle the read status of a book
function bookRead(event) {
  let checkbox = event.target;
  let bookCard = checkbox.parentNode.parentNode;
  let bookIndex = Number(bookCard.getAttribute("data-book-index"));
  let book = LIBRARY[bookIndex];

  if (checkbox.checked) {
    book.read = true;
  } else {
    book.read = false;
  }
}

let form = document.getElementById("newBookForm");
form.addEventListener("submit", submitBook);
