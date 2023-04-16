const EventEmitter = (function () {
  function EventEmitter() {
    this.listeners = {};
  }

  EventEmitter.prototype.on = function (event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.off(event, callback);
    };
  };

  EventEmitter.prototype.off = function (event, callback) {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== callback
    );
  };

  EventEmitter.prototype.emit = function (event, data) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach((callback) => callback(data));
  };

  return EventEmitter;
})();

var eventBus = new EventEmitter();

const LIBRARY = (function (eventEmitter) {
  const _LIBRARY = [];
  const _book = {
    init(title, author, pages, read) {
      this.title = title;
      this.author = author;
      this.pages = pages;
      this.read = read;
      return this;
    },
    info() {
      return `${this.title} by ${this.author}, ${this.pages} pages. ${
        this.read ? "Read." : "Not read yet."
      }`;
    },
  };
  function _Book() {
    const b = Object.create(_book);
    b.init(...arguments);
    return b;
  }
  function addBook(book) {
    _LIBRARY.push(book);
    eventEmitter.emit("bookAdded", book);
  }

  function removeBook(book) {
    let index = _LIBRARY.indexOf(book);
    if (index !== -1) {
      _LIBRARY.splice(index, 1);
    }
    eventEmitter.emit("bookRemoved", book);
  }

  function registerBook(bookInfo) {
    let book = _Book(
      bookInfo.title,
      bookInfo.author,
      bookInfo.pages,
      bookInfo.read
    );
    book.id = _LIBRARY.length;
    addBook(book);
  }

  function getBook(bookId) {
    return _LIBRARY[bookId];
  }
  return { addBook, removeBook, registerBook, getBook };
})(eventBus);

const LIBRARY_DISPLAY = (function (eventEmitter) {
  let _bookDisplay = document.getElementById("myBooks");
  let _newBookForm = document.getElementById("newBookForm");
  let _overlay = document.getElementById("dim-overlay");
  let _infoDisplay = document.getElementById("infoDisplay");
  let _resetFormButton = document.getElementById("resetFormButton");
  let _addBookButton = document.getElementById("addBook");
  let _closeInfoBttn = document.getElementById("closeInfoBttn");

  function initialize() {
    eventEmitter.on("bookAdded", _render.bind(null, "add"));
    eventEmitter.on("bookRemoved", _render.bind(null, "remove"));

    _newBookForm.addEventListener("submit", _submitBook);
    _resetFormButton.addEventListener("click", _cancelForm);
    _addBookButton.addEventListener("click", _showForm);
    _closeInfoBttn.addEventListener("click", _closeInfo);
  }

  function _render(action, book) {
    if (action === "add") {
      let bookCard = _createBookCard(book);
      _bookDisplay.appendChild(bookCard);
    } else if (action === "remove") {
      let bookId = book.id;
      _bookDisplay.children[bookId].remove();
      _updateBookCardIds(bookId);
    }
  }

  function _updateBookCardIds(startIndex) {
    let bookCards = Array.from(_bookDisplay.children).slice(startIndex);

    for (let card of bookCards) {
      let cardId = Number(card.getAttribute("data-book-id"));
      card.setAttribute("data-book-id", --cardId);
    }
  }

  function _createBookCard(book) {
    let bookCard = document.createElement("div");
    bookCard.classList.add("bookCard");

    let bookTitle = document.createElement("h2");
    bookTitle.textContent = book.title;
    bookTitle.classList.add("bookTitle");

    let bookAuthor = document.createElement("h3");
    bookAuthor.textContent = "By\n" + book.author;
    bookAuthor.classList.add("bookAuthor");

    let bookOptions = _createBookOptions(book);

    bookCard.appendChild(bookTitle);
    bookCard.appendChild(bookAuthor);
    bookCard.appendChild(bookOptions);
    bookCard.setAttribute("data-book-id", book.id);
    return bookCard;
  }

  // Create book options (Delete, Info, Read)
  function _createBookOptions(book) {
    let bookOptions = document.createElement("div");
    bookOptions.classList.add("bookOptions");

    let remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.addEventListener("click", _removeBook);

    let info = document.createElement("button");
    info.textContent = "Info";
    info.addEventListener("click", _bookInfo);

    let read = document.createElement("input");
    read.type = "checkbox";
    if (book.read) {
      read.checked = true;
    }
    read.addEventListener("change", _bookRead);

    bookOptions.appendChild(remove);
    bookOptions.appendChild(info);
    bookOptions.appendChild(read);

    return bookOptions;
  }

  // Submit a new book
  function _submitBook(event) {
    event.preventDefault();
    let title = document.getElementById("title").value;
    let author = document.getElementById("author").value;
    let pages = document.getElementById("pages").value;
    let read = document.getElementById("read").checked;
    LIBRARY.registerBook({ title, author, pages, read });
    _newBookForm.reset();
    _cancelForm();
  }

  function _cancelForm() {
    _newBookForm.style.visibility = "hidden";
    _overlay.style.visibility = "hidden";
  }

  // Show the new book form
  function _showForm() {
    _overlay.style.visibility = "visible";
    _newBookForm.style.visibility = "visible";
  }

  function _bookInfo(event) {
    let button = event.target;
    let bookCard = button.parentNode.parentNode;
    let bookId = Number(bookCard.getAttribute("data-book-id"));
    let book = LIBRARY.getBook(bookId);

    // Dim the app with overlay
    _overlay.style.visibility = "visible";

    // Bring book Info to the front
    _infoDisplay.style.visibility = "visible";

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
  function _closeInfo() {
    _overlay.style.visibility = "hidden";
    _infoDisplay.style.visibility = "hidden";
  }

  function _removeBook(event) {
    let button = event.target;
    let bookCard = button.parentNode.parentNode;

    let bookId = bookCard.getAttribute("data-book-id");
    let book = LIBRARY.getBook(bookId);

    LIBRARY.removeBook(book);
  }

  function _bookRead(event) {
    let checkbox = event.target;
    let bookCard = checkbox.parentNode.parentNode;
    let bookId = bookCard.getAttribute("data-book-id");
    let book = LIBRARY.getBook(bookId);

    if (checkbox.checked) {
      book.read = true;
    } else {
      book.read = false;
    }
  }

  initialize();
})(eventBus);
