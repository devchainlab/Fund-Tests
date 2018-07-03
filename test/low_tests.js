var LowFundDeposit = artifacts.require("LowFundDeposit");
var LowWithdraw = artifacts.require("LowWithdraw");
var DataBase = artifacts.require("DataBase");

contract('DataBase', async (accounts) => {
    let owner = accounts[0];

    this.setTokenPrice = function(_highPrice, _averagePrice, _lowPrice, _futurePrice) {
        it ('set token price', async () => {
            let instance = await DataBase.deployed();
            await instance.changeTokenPrices(_highPrice, _averagePrice, _lowPrice, _futurePrice);
        });
    };

});

var INVEST_AMOUNT = 100000000000000000;
var CURRENT_PRICE = 30000;
var NEXT_PRICE = 3000;
var TOTAL_PROFIT = INVEST_AMOUNT * CURRENT_PRICE / NEXT_PRICE;

contract('LowWithdraw', async (accounts) => {
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
        var ref3Add = INVEST_AMOUNT + TOTAL_PROFIT / 100 * 70;
        var ref2Add = TOTAL_PROFIT / 100 * 5;
        var ref1Add = TOTAL_PROFIT / 100 * 2;
        var userAdd = TOTAL_PROFIT / 100;

        it ('withdraw test (with referral)', async () => {
            refreshBalances();
            let instance = await LowWithdraw.deployed();
            let db = await DataBase.deployed();
            await db.setWithdraw(owner, owner, instance.address, owner);
            await instance.sellLow(ref3, {from: owner, value: _etherAmount});
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
            let instance = await LowWithdraw.deployed();
            var ref4Balance = web3.eth.getBalance(ref4).toNumber();
            await instance.sellLow(ref4, {from: owner, value: _etherAmount});
            var ref4NewBalance = web3.eth.getBalance(ref4).toNumber();
            assert.equal(ref4NewBalance - ref4Balance, ref3Add)
        });
    };
});

contract('LowFundDeposit', async (accounts) => {
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
        var firstStepAdd = _etherAmount / 100 * 5;
        var secondStepAdd = _etherAmount / 100 * 2;
        var thirdStepAdd = _etherAmount / 100;

        it ('buy with referral (ref1)', async () => {
            refreshBalances();
            let instance = await LowFundDeposit.deployed();
            let db = await DataBase.deployed();
            await db.setFund(owner, owner, instance.address, owner);
            await instance.buyLow(user, {from: ref1, value: _etherAmount});
            var userNewBalance = web3.eth.getBalance(user).toNumber();
            assert.equal(userNewBalance - userBalance, firstStepAdd);
        });
        it ('buy with referral (ref2)', async () => {
            refreshBalances();
            let instance = await LowFundDeposit.deployed();
            await instance.buyLow(ref1, {from: ref2, value: _etherAmount});
            var ref1NewBalance = web3.eth.getBalance(ref1).toNumber();
            var userNewBalance = web3.eth.getBalance(user).toNumber();
            assert.equal(ref1NewBalance - ref1Balance, firstStepAdd);
            assert.equal(userNewBalance - userBalance, secondStepAdd);
        });
        it ('buy with referral (ref3)', async () => {
            refreshBalances();
            let instance = await LowFundDeposit.deployed();
            await instance.buyLow(ref2, {from: ref3, value: _etherAmount});
            var ref2NewBalance = web3.eth.getBalance(ref2).toNumber();
            var ref1NewBalance = web3.eth.getBalance(ref1).toNumber();
            var userNewBalance = web3.eth.getBalance(user).toNumber();
            assert.equal(ref2NewBalance - ref2Balance, firstStepAdd);
            assert.equal(ref1NewBalance - ref1Balance, secondStepAdd);
            assert.equal(userNewBalance - userBalance, thirdStepAdd);
        });
        it ('buy without referral', async () => {
            refreshBalances();
            let instance = await LowFundDeposit.deployed();
            await instance.sendTransaction({from: ref4, value: _etherAmount});
        });
    }

    fundTest(INVEST_AMOUNT);
    this.setTokenPrice(0, 0, NEXT_PRICE, 0);
    this.withdrawTest(TOTAL_PROFIT + INVEST_AMOUNT);
});
