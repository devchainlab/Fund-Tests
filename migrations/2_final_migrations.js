var DataBase = artifacts.require("./DataBase");
var HighFundDeposit = artifacts.require("./HighFundDeposit");
var HighWithdraw = artifacts.require("./HighWithdraw");
var AverageFundDeposit = artifacts.require("./AverageFundDeposit");
var AverageWithdraw = artifacts.require("./AverageWithdraw");
var LowFundDeposit = artifacts.require("./LowFundDeposit");
var LowWithdraw = artifacts.require("./LowWithdraw");

module.exports = function(deployer) {
    deployer.deploy(DataBase).then(function() {
        deployer.deploy(HighFundDeposit, DataBase.address);
        deployer.deploy(HighWithdraw, DataBase.address);
        deployer.deploy(LowFundDeposit, DataBase.address);
        deployer.deploy(LowWithdraw, DataBase.address);
        deployer.deploy(AverageFundDeposit, DataBase.address);
        return deployer.deploy(AverageWithdraw, DataBase.address);
    });
};
