"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const await_timeout_1 = __importDefault(require("await-timeout"));
const config_json_1 = __importDefault(require("../src/config.json"));
const fs_1 = __importDefault(require("fs"));
const RPC = 'https://linea.decubate.com';
const classicPoolFactoryAddress = "0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d";
const SyncSwapClassicPoolFactory_json_1 = __importDefault(require("../src/abi/SyncSwapClassicPoolFactory.json"));
let data = fs_1.default.readFileSync('./src/wallets.txt').toString('utf-8');
let privates = data.split("\r\n");
const provider = new ethers_1.providers.JsonRpcProvider(RPC);
const classicPoolFactory = new ethers_1.Contract(classicPoolFactoryAddress, SyncSwapClassicPoolFactory_json_1.default, provider);
function swap(privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const wETHAddress = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f";
        const usdcAddress = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";
        const routerAddress = "0x80e38291e06339d10AAB483C65695D004dBD5C69";
        const routerAbi = require("../src/abi/SyncSwapRouter.json");
        const signer = new ethers_1.Wallet(privateKey, provider);
        const balance = yield getETHBalance(signer.address);
        let amountForLog = getRandomAmountETH();
        if (balance < amountForLog) {
            console.log("insufficient ETH balance");
        }
        let amount = ethers_1.utils.parseEther(amountForLog.toString());
        let tokenInAddress = wETHAddress;
        const poolAddress = yield classicPoolFactory.getPool(wETHAddress, usdcAddress);
        if (poolAddress === ethers_1.constants.AddressZero) {
            console.log('pool not exists');
            return;
        }
        const withdrawMode = 1;
        const swapData = ethers_1.utils.defaultAbiCoder.encode(["address", "address", "uint8"], [tokenInAddress, signer.address, withdrawMode]);
        const steps = [{
                pool: poolAddress,
                data: swapData,
                callback: ethers_1.constants.AddressZero,
                callbackData: '0x',
            }];
        const paths = [{
                steps: steps,
                tokenIn: ethers_1.constants.AddressZero,
                amountIn: amount,
            }];
        const router = new ethers_1.Contract(routerAddress, routerAbi, signer);
        try {
            const response = yield router.swap(paths, 0, ethers_1.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), {
                value: amount, // please uncomment this if your token in is ETH
                gasLimit: 14000000
            });
            let tx = yield response.wait();
            const delay = getRandomDelay();
            yield await_timeout_1.default.set(delay);
            console.log("Delay: ", delay, " seconds");
            console.log("Address: ", signer.address);
            console.log("ETH -> USDC");
            console.log("In ETH amount: ", amountForLog);
            console.log("tx hash: ", tx);
        }
        catch (error) {
            const delay = getRandomDelay();
            yield await_timeout_1.default.set(delay);
            console.log("Delay: ", delay, " seconds");
            console.log("Address: ", signer.address);
            console.log("ETH -> USDC");
            console.log("In ETH amount: ", amountForLog);
            console.error("Error: ", error);
        }
    });
}
function randomInteger(min, max) {
    if (max === 0) {
        return 0;
    }
    else {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
function getETHBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance = yield provider.getBalance(address);
        return Number(ethers_1.utils.formatEther(balance));
    });
}
function getRandomAmountETH() {
    return Math.random() * (config_json_1.default.toAmount - config_json_1.default.fromAmount) + config_json_1.default.fromAmount;
}
function getRandomDelay() {
    return Math.random() * (config_json_1.default.toDelay - config_json_1.default.fromDelay) + config_json_1.default.fromDelay;
}
function go() {
    return __awaiter(this, void 0, void 0, function* () {
        if (config_json_1.default.fromDelay >= config_json_1.default.toDelay) {
            console.log("incorrect delay range");
            return;
        }
        if (config_json_1.default.fromAmount >= config_json_1.default.toAmount) {
            console.log("incorrect amount range");
            return;
        }
        if (config_json_1.default.randomMode) {
            const lengthArray = privates.length;
            for (let _i = 0; _i < lengthArray; _i++) {
                const r = randomInteger(0, privates.length - 1);
                const targetPrivate = privates[r];
                privates.splice(r, 1);
                yield swap(targetPrivate);
            }
        }
        else {
            for (const privateKey of privates) {
                yield swap(privateKey);
            }
        }
    });
}
go();
