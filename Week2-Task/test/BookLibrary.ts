import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BookLibrary } from "./../typechain-types/contracts/BookLibrary";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
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

  describe("BookAdding", function () {});

  describe("BookBorrow", function () {});

  describe("BookReturn", function () {});

  describe("Events", function () {
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
      const bookTitle = "Shogun";
      //toUtf8Bytes because the addNewBook method uses abi.encodedPacked which returns uint8 encoding
      //if abi.encode used in contract, which returns 32 bytes, utils.formatBytes32String will be needed
      const bookTitleBytes32String = ethers.utils.toUtf8Bytes(bookTitle);
      const bookTitleHashed = ethers.utils.keccak256(bookTitleBytes32String);

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
      const bookTitle = "Tai Pan";
      //see notes in previous test
      const bookTitleBytes32String = ethers.utils.toUtf8Bytes(bookTitle);
      const bookTitleHashed = ethers.utils.keccak256(bookTitleBytes32String);

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
