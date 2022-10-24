const hre = require("hardhat");
const BookLibrary = require('../artifacts/contracts/BookLibrary.sol/BookLibrary.json')

const run = async function() {
    const provider = new hre.ethers.providers.InfuraProvider(
        "goerli",
        "199e48875a4f431e8ebaed6412865604"
      );

    const wallet = new hre.ethers.Wallet("8b81e9caa6bf9213794c34c4a12b2fe85996a94bd4e0845659ba7325ddd3cdfc", provider)
    const balance = await wallet.getBalance();
    console.log(balance);

    const bookLibraryContract = new hre.ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", BookLibrary.abi, wallet)
    //console.log(bookLibraryContract);
    //const contractOwner = await bookLibraryContract.owner();
    //console.log(contractOwner);

    //create a book
    const createBook = await bookLibraryContract.addNewBook("BookName", 3, {gasLimit: 5000000});
    const transactionReceipt = await createBook.wait();
    if (transactionReceipt.status != 1) {
        console.log("Transaction was not successful")
        return 
    }

    //checks all available books
    const availableBooks = await bookLibraryContract.getNumberOfBooks();
    const firstBookKey = await bookLibraryContract.bookKeys(0);
    const firstBook = await bookLibraryContract.books(firstBookKey);
    console.log("All Available books:", availableBooks);
    console.log("First book key:", firstBookKey);
    console.log("First available Book:", firstBook);

    //rents a book
    const borrowedBook = await bookLibraryContract.borrowBook(firstBookKey);
    console.log("Borrowed book", borrowedBook);

    //checks that it is rented
    const borrowedBookAddresses = await bookLibraryContract.getBookBorrowersAddresses(firstBookKey);
    console.log("Borrowed book addresses:", borrowedBookAddresses);

    //returns the book
    const returnedBook = await bookLibraryContract.returnBook(firstBookKey);
    console.log("Book returned:", returnedBook);

    //checks the availability of the book
    const firstBookAgain = await bookLibraryContract.books(firstBookKey);
console.log("First book availabiliy:", firstBookAgain);
}

run()