task("deploy-testnets", "Deploys contract on a provided network")
.setAction(async () => {
    const deployBookLibraryContract = require("../scripts/deploy");
    await deployBookLibraryContract();
});

module.exports = task;