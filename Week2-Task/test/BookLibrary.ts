import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BookLibrary", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBookLibraryFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const BookLibrary = await ethers.getContractFactory("BookLibrary");
    const bookLibrary = await BookLibrary.deploy();

    return { owner, otherAccount, bookLibrary };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { bookLibrary, owner } = await loadFixture(
        deployBookLibraryFixture
      );
      expect(await bookLibrary.owner()).to.equal(owner.address);
    });
  });

  describe("BookAdding", function () {
    const bookTitle = "King Rat";
    const bookTitleBytes32String = ethers.utils.toUtf8Bytes(bookTitle);
    const bookTitleHashed = ethers.utils.keccak256(bookTitleBytes32String);
    const bookCopies = 1;

    it("Should add book", async function () {
      const { bookLibrary } = await loadFixture(deployBookLibraryFixture);

      await bookLibrary.addNewBook(bookTitle, bookCopies);
      const book = await bookLibrary.books(bookTitleHashed);

      expect(book.title).to.equal(bookTitle);
      expect(book.copies).to.equal(bookCopies);
      expect(await bookLibrary.bookKeys(0)).to.equal(bookTitleHashed);
    });

    it("Should fail if not owner", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(
        deployBookLibraryFixture
      );

      await expect(
        bookLibrary.connect(otherAccount).addNewBook(bookTitle, bookCopies)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail if invalid book title", async function () {
      const { bookLibrary } = await loadFixture(deployBookLibraryFixture);

      await expect(bookLibrary.addNewBook("", bookCopies)).to.be.revertedWith(
        "Book data is not valid!"
      );
    });

    it("Should fail if invalid book copies count", async function () {
      const { bookLibrary } = await loadFixture(deployBookLibraryFixture);

      await expect(bookLibrary.addNewBook(bookTitle, 0)).to.be.revertedWith(
        "Book data is not valid!"
      );
    });

    it("Should fail if book already exists", async function () {
      const { bookLibrary } = await loadFixture(deployBookLibraryFixture);
      await bookLibrary.addNewBook(bookTitle, bookCopies);

      await expect(
        bookLibrary.addNewBook(bookTitle, bookCopies)
      ).to.be.revertedWith("Book already added.");
    });
  });

  describe("BookBorrow", function () {
    const bookTitle = "Kalkuta";
    const bookTitleBytes32String = ethers.utils.toUtf8Bytes(bookTitle);
    const bookTitleHashed = ethers.utils.keccak256(bookTitleBytes32String);
    const bookCopies = 2;

    it("Should borrow book", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(
        deployBookLibraryFixture
      );

      await bookLibrary.addNewBook(bookTitle, bookCopies);
      await bookLibrary.connect(otherAccount).borrowBook(bookTitleHashed);

      const book = await bookLibrary.books(bookTitleHashed);

      expect(book.copies).to.equal(bookCopies - 1);
      //expect(book.borrowersAddressesHistory(0)).to.equal(otherAccount.address);
      expect(
        await bookLibrary.currentBorrowers(
          otherAccount.address,
          bookTitleHashed
        )
      ).to.equal(true);
    });

    it("Should fail if already borrowed one copy", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(
        deployBookLibraryFixture
      );

      await bookLibrary.addNewBook(bookTitle, bookCopies);
      await bookLibrary.connect(otherAccount).borrowBook(bookTitleHashed);

      await expect(
        bookLibrary.connect(otherAccount).borrowBook(bookTitleHashed)
      ).to.be.revertedWith("User already borrowed a copy of the book.");
    });

    it("Should fail book has no available copies", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(
        deployBookLibraryFixture
      );

      await bookLibrary.addNewBook(bookTitle, 1);
      await bookLibrary.borrowBook(bookTitleHashed);

      await expect(
        bookLibrary.connect(otherAccount).borrowBook(bookTitleHashed)
      ).to.be.revertedWith("No copies available.");
    });

    it("Should return borrowers history of book", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(
        deployBookLibraryFixture
      );

      await bookLibrary.addNewBook(bookTitle, bookCopies);
      await bookLibrary.connect(otherAccount).borrowBook(bookTitleHashed);

      const result = await bookLibrary.getBookBorrowersAddresses(
        bookTitleHashed
      );
      expect(result).with.lengthOf(1);
      expect(result[0]).to.equal(otherAccount.address);
    });
  });

  describe("BookReturn", function () {
    const bookTitle = "Tai Pan";
    const bookTitleBytes32String = ethers.utils.toUtf8Bytes(bookTitle);
    const bookTitleHashed = ethers.utils.keccak256(bookTitleBytes32String);
    const bookCopies = 1;

    it("Should return book", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(
        deployBookLibraryFixture
      );

      await bookLibrary.addNewBook(bookTitle, bookCopies);
      await bookLibrary.connect(otherAccount).borrowBook(bookTitleHashed);
      await bookLibrary.connect(otherAccount).returnBook(bookTitleHashed);

      const book = await bookLibrary.books(bookTitleHashed);
      const isBorrowedByOtherAccount = await bookLibrary.currentBorrowers(
        otherAccount.address,
        bookTitleHashed
      );

      expect(book.copies).to.equal(bookCopies);
      expect(isBorrowedByOtherAccount).to.equal(false);
    });

    it("Should fail if book not borrowed by addres", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(
        deployBookLibraryFixture
      );

      await bookLibrary.addNewBook(bookTitle, bookCopies);
      await bookLibrary.borrowBook(bookTitleHashed);

      await expect(
        bookLibrary.connect(otherAccount).returnBook(bookTitleHashed)
      ).to.be.revertedWith("Cannot return book not borrowed by you");
    });
  });

  describe("Getters", function () {
    it("Should return number of books", async function () {
      const { bookLibrary } = await loadFixture(deployBookLibraryFixture);
      expect(await bookLibrary.getNumberOfBooks()).to.equal(0);
    });
  });

  describe("Events", function () {
    const bookTitle = "Shogun";
    //toUtf8Bytes because the addNewBook method uses abi.encodedPacked which returns uint8 encoding
    //if abi.encode used in contract, which returns 32 bytes, utils.formatBytes32String will be needed
    const bookTitleBytes32String = ethers.utils.toUtf8Bytes(bookTitle);
    const bookTitleHashed = ethers.utils.keccak256(bookTitleBytes32String);

    it("Should emit an event on book added", async function () {
      const { bookLibrary } = await loadFixture(deployBookLibraryFixture);
      const bookName = "TestBookName";
      const bookCopies = 3;

      await expect(bookLibrary.addNewBook(bookName, bookCopies))
        .to.emit(bookLibrary, "LogAddedBook")
        .withArgs(bookName, bookCopies);
    });

    it("Should emit an event on book borrowed", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(
        deployBookLibraryFixture
      );

      await bookLibrary.addNewBook(bookTitle, 3);

      await expect(
        bookLibrary.connect(otherAccount).borrowBook(bookTitleHashed)
      )
        .to.emit(bookLibrary, "BookBorrowed")
        .withArgs(bookTitle, otherAccount.address);
    });

    it("Should emit an event on book returned", async function () {
      const { bookLibrary, otherAccount } = await loadFixture(
        deployBookLibraryFixture
      );
      await bookLibrary.addNewBook(bookTitle, 3);
      await bookLibrary.connect(otherAccount).borrowBook(bookTitleHashed);

      await expect(
        bookLibrary.connect(otherAccount).returnBook(bookTitleHashed)
      )
        .to.emit(bookLibrary, "BookReturned")
        .withArgs(bookTitle, otherAccount.address);
    });
  });
});
