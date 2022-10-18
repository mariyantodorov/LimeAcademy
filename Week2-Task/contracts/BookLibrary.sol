// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BookLibrary is Ownable {
    struct Book {
        string name;
        uint availableCopies;
        address[] borrowersHistory;
    }

    Book[] public books;

    mapping(string => uint) bookNameToId;
    mapping(address => mapping(uint => bool)) currentBorrowers;

    //users should not be able to borrow a book more times than the copies in the libraries unless copy is returned
    modifier onlyAvailable(uint _id) {
        require(books[_id].availableCopies > 0, "No copies available.");
        _;
    }

    //should not borrow more than one copy of a book at a time
    modifier borrowOnlyOneCopy(uint _id) {
        require(
            !currentBorrowers[msg.sender][_id],
            "User already borrowed a copy of the book."
        );
        _;
    }

    //The administrator (owner) of the library should be able to add new books and the number of copies in the library.
    function addNewBook(string memory _name, uint _copies) public onlyOwner {
        require(bytes(_name).length > 0, "Name cannot be empty.");
        require(bookNameToId[_name] == 0, "Book already exists.");
        require(_copies > 0, "Cannot add 0 copies of a book.");

        Book memory book;
        book.name = _name;
        book.availableCopies = _copies;
        books.push(book);
        bookNameToId[_name] = books.length - 1;
    }

    function getBooks() public view onlyOwner returns (Book[] memory) {
        return books;
    }

    //Users should be able to see the available books
    function getAvailableBooks() external view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 0; i < books.length; i++) {
            if (books[i].availableCopies > 0) {
                count++;
            }
        }

        uint[] memory result = new uint[](count);
        uint counter = 0;
        for (uint i = 0; i < books.length; i++) {
            if (books[i].availableCopies > 0) {
                result[counter] = i;
                counter++;
            }
        }

        return result;
    }

    //Users should be able to borrow them by their id
    function borrowBook(uint _id)
        external
        borrowOnlyOneCopy(_id)
        onlyAvailable(_id)
    {
        currentBorrowers[msg.sender][_id] = true;
        books[_id].availableCopies--;
        books[_id].borrowersHistory.push(msg.sender); //check if already exists?
    }

    //Users should be able to return books.
    function returnBook(uint _id) external {
        require(
            currentBorrowers[msg.sender][_id] == true,
            "Cannot return book not borrowed by you"
        );
        currentBorrowers[msg.sender][_id] = false;
        books[_id].availableCopies++;
    }

    //Everyone should be able to see the addresses of all people that have ever borrowed a given book
    function viewBookBorrowers(uint _id)
        external
        view
        returns (address[] memory)
    {
        return books[_id].borrowersHistory;
    }
}
