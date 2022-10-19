task("deploy-mainnet", "Deploys contract on a provided network")
  .addParam(
    "privateKey",
    "Please provide the private key"
  )
  .setAction(async({privateKey}) => {    
    const deployBookLibraryContract = require("../scripts/deploy-with-param");
    await deployBookLibraryContract(privateKey);
  });

module.exports = task;
