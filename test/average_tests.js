var AverageFundDeposit = artifacts.require("AverageFundDeposit");
var AverageWithdraw = artifacts.require("AverageWithdraw");
var DataBase = artifacts.require("DataBase");

contract('DataBase', async (accounts) => {
    let owner = accounts[0];

    this.setRealPartner = function() {
        it ('set real partner', async () => {
            let instance = await DataBase.deployed();
            for (var i = 1; i < accounts.length; i++) {
                await instance.setRealReferral(accounts[i], true);
            }
        });
    };

    this.setTokenPrice = function(_highPrice, _averagePrice, _lowPrice, _futurePrice) {
        it ('set token price', async () => {
            let instance = await DataBase.deployed();
            await instance.changeTokenPrices(_highPrice, _averagePrice, _lowPrice, _futurePrice);
        });
    };

});

var INVEST_AMOUNT = 100000000000000000;
var CURRENT_PRICE = 20000;
var NEXT_PRICE = 2000;
var TOTAL_PROFIT = INVEST_AMOUNT * CURRENT_PRICE / NEXT_PRICE;

contract('AverageWithdraw', async (accounts) => {
    let owner = accounts[0];
    let user = accounts[1];
    let ref1 = accounts[2];
    let ref2 = accounts[3];
    let ref3 = accounts[4];
    let ref4 = accounts[5];

    var userBalance;
    var ref1Balance;
    var ref2Balance;
    var ref3Balance;

    function refreshBalances() {
        userBalance = web3.eth.getBalance(user).toNumber();
        ref1Balance = web3.eth.getBalance(ref1).toNumber();
        ref2Balance = web3.eth.getBalance(ref2).toNumber();
        ref3Balance = web3.eth.getBalance(ref3).toNumber();
    }

    this.withdrawTest = function(_etherAmount) {
        var ref3Add = INVEST_AMOUNT + TOTAL_PROFIT / 100 * 60;
        var ref2Add = TOTAL_PROFIT / 100 * 4;
        var ref1Add = TOTAL_PROFIT / 100 * 2;
        var userAdd = TOTAL_PROFIT / 100;

        it ('withdraw test (with referral)', async () => {
            refreshBalances();
            let instance = await AverageWithdraw.deployed();
            let db = await DataBase.deployed();
            await db.setWithdraw(owner, instance.address, owner, owner);
            await instance.sellAverage(ref3, {from: owner, value: _etherAmount});
            var userNewBalance = web3.eth.getBalance(user).toNumber();
            var ref1NewBalance = web3.eth.getBalance(ref1).toNumber();
            var ref2NewBalance = web3.eth.getBalance(ref2).toNumber();
            var ref3NewBalance = web3.eth.getBalance(ref3).toNumber();
            assert.equal(ref2NewBalance - ref2Balance, ref2Add);
            assert.equal(ref1NewBalance - ref1Balance, ref1Add);
            assert.equal(userNewBalance - userBalance, userAdd);
            assert.equal(ref3NewBalance - ref3Balance, ref3Add);
        });
        it ('withdraw test (without referral)', async () => {
            let instance = await AverageWithdraw.deployed();
            var ref4Balance = web3.eth.getBalance(ref4).toNumber();
            await instance.sellAverage(ref4, {from: owner, value: _etherAmount});
            var ref4NewBalance = web3.eth.getBalance(ref4).toNumber();
            assert.equal(ref4NewBalance - ref4Balance, ref3Add)
        });
    };
});

contract('AverageFundDeposit', async (accounts) => {
    let owner = accounts[0];
    let user = accounts[1];
    let ref1 = accounts[2];
    let ref2 = accounts[3];
    let ref3 = accounts[4];
    let ref4 = accounts[5];

    var userBalance;
    var ref1Balance;
    var ref2Balance;
    var ref3Balance;

    function refreshBalances() {
        userBalance = web3.eth.getBalance(user).toNumber();
        ref1Balance = web3.eth.getBalance(ref1).toNumber();
        ref2Balance = web3.eth.getBalance(ref2).toNumber();
        ref3Balance = web3.eth.getBalance(ref3).toNumber();
    }

    function fundTest(_etherAmount) {
        var firstStepAdd = _etherAmount / 100 * 4;
        var secondStepAdd = _etherAmount / 100 * 2;
        var thirdStepAdd = _etherAmount / 100;

        it ('buy with referral (ref1)', async () => {
            refreshBalances();
            let instance = await AverageFundDeposit.deployed();
            let db = await DataBase.deployed();
            await db.setFund(owner, instance.address, owner, owner);
            await instance.buyAverage(user, {from: ref1, value: _etherAmount});
            var userNewBalance = web3.eth.getBalance(user).toNumber();
            assert.equal(userNewBalance - userBalance, firstStepAdd);
        });
        it ('buy with referral (ref2)', async () => {
            refreshBalances();
            let instance = await AverageFundDeposit.deployed();
            await instance.buyAverage(ref1, {from: ref2, value: _etherAmount});
            var ref1NewBalance = web3.eth.getBalance(ref1).toNumber();
            var userNewBalance = web3.eth.getBalance(user).toNumber();
            assert.equal(ref1NewBalance - ref1Balance, firstStepAdd);
            assert.equal(userNewBalance - userBalance, secondStepAdd);
        });
        it ('buy with referral (ref3)', async () => {
            refreshBalances();
            let instance = await AverageFundDeposit.deployed();
            await instance.buyAverage(ref2, {from: ref3, value: _etherAmount});
            var ref2NewBalance = web3.eth.getBalance(ref2).toNumber();
            var ref1NewBalance = web3.eth.getBalance(ref1).toNumber();
            var userNewBalance = web3.eth.getBalance(user).toNumber();
            assert.equal(ref2NewBalance - ref2Balance, firstStepAdd);
            assert.equal(ref1NewBalance - ref1Balance, secondStepAdd);
            assert.equal(userNewBalance - userBalance, thirdStepAdd);
        });
        it ('buy without referral', async () => {
            refreshBalances();
            let instance = await AverageFundDeposit.deployed();
            await instance.sendTransaction({from: ref4, value: _etherAmount});
        });
    }

    this.setRealPartner();
    fundTest(INVEST_AMOUNT);
    this.setTokenPrice(0, NEXT_PRICE, 0, 0);
    this.withdrawTest(TOTAL_PROFIT + INVEST_AMOUNT);
});
