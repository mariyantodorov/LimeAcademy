// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

//custom errors

contract BookLibrary is Ownable {
    //constructor

    //declarations
    struct Book {
        string title;
        uint8 copies;
        address[] borrowersAddressesHistory;
    }  

    bytes32[] public bookKeys;

    mapping(bytes32 => Book) public books;
    mapping(address => mapping(bytes32 => bool)) public currentBorrowers;

    //events
    event LogAddedBook(string title, uint copies);
    event BookBorrowed(string title, address user);
    event BookReturned(string title, address user);

    //modifiers
    modifier validBookData(string memory _title, uint8 _copies) {
        bytes memory tempTitle = bytes(_title);
        require(tempTitle.length > 0 && _copies > 0, "Book data is not valid!");
        _;
    }

    modifier bookDoesNotExist(string memory _title) {
        require(bytes(books[keccak256(abi.encodePacked(_title))].title).length == 0, "Book already added.");
        _;
    }

    //users should not be able to borrow a book more times than the copies in the libraries unless copy is returned
    modifier onlyAvailable(bytes32 _id) {
        require(books[_id].copies > 0, "No copies available.");
        _;
    }

    //should not borrow more than one copy of a book at a time
    modifier borrowOnlyOneCopy(bytes32 _id) {
        require(
            !currentBorrowers[msg.sender][_id],
            "User already borrowed a copy of the book."
        );
        _;
    }

    //functions

    //The administrator (owner) of the library should be able to add new books and the number of copies in the library.
    function addNewBook(string memory _title, uint8 _copies) 
        public 
        onlyOwner 
        validBookData(_title, _copies) 
        bookDoesNotExist(_title) 
    {
        address[] memory borrowers;
        Book memory newBook = Book(_title, _copies, borrowers);
        books[keccak256(abi.encodePacked(_title))] = newBook;
        bookKeys.push(keccak256(abi.encodePacked(_title)));
        emit LogAddedBook(_title, _copies);
    }

    //Users should be able to see the available books 
    //We return the lenght of the book keys array. 
    //The Iterations happens outside of the contract then we can get a specific book by Id
    function getNumberOfBooks() external view returns (uint _numberOfBooks) {
        return bookKeys.length;
    }

    //Users should be able to borrow them by their id
    function borrowBook(bytes32 _id)
        external
        borrowOnlyOneCopy(_id)
        onlyAvailable(_id)
    {
        currentBorrowers[msg.sender][_id] = true;
        books[_id].copies--;
        books[_id].borrowersAddressesHistory.push(msg.sender);

        emit BookBorrowed(books[_id].title, msg.sender);
    }

    //Users should be able to return books.
    function returnBook(bytes32 _id) external {
        require(
            currentBorrowers[msg.sender][_id] == true,
            "Cannot return book not borrowed by you"
        );
        currentBorrowers[msg.sender][_id] = false;
        books[_id].copies++;

        emit BookReturned(books[_id].title, msg.sender);
    }

    //Everyone should be able to see the addresses of all people that have ever borrowed a given book
    function getBookBorrowersAddresses(bytes32 _id)
        external
        view
        returns (address[] memory)
    {
        return books[_id].borrowersAddressesHistory;
    }
}
