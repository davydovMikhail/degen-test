import { Wallet, providers, utils, Contract, BigNumber, constants } from 'ethers';
import Timeout from 'await-timeout';
import config from '../src/config.json';
import fs from 'fs';
const RPC = 'https://linea.decubate.com';
const classicPoolFactoryAddress = "0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d";
import classicPoolFactoryAbi from "../src/abi/SyncSwapClassicPoolFactory.json";
let data: string = fs.readFileSync('./src/wallets.txt').toString('utf-8');
let privates: string[] = data.split("\r\n");
const provider = new providers.JsonRpcProvider(RPC);
const classicPoolFactory = new Contract(
    classicPoolFactoryAddress,
    classicPoolFactoryAbi,
    provider
);

async function swap(privateKey: string) {
    const wETHAddress = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f";
    const usdcAddress = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";
    const routerAddress = "0x80e38291e06339d10AAB483C65695D004dBD5C69";
    const routerAbi = require("../src/abi/SyncSwapRouter.json");
    const signer = new Wallet(privateKey, provider); 
    const balance = await getETHBalance(signer.address);
    let amountForLog: number | BigNumber = getRandomAmountETH();
    if(balance < amountForLog) {
        console.log("insufficient ETH balance");
    }
    let amount = utils.parseEther(amountForLog.toString());
    let tokenInAddress = wETHAddress;
    const poolAddress = await classicPoolFactory.getPool(wETHAddress, usdcAddress);
    if (poolAddress === constants.AddressZero) {
        console.log('pool not exists');
        return;
    }
    const withdrawMode = 1; 
    const swapData: string = utils.defaultAbiCoder.encode(
        ["address", "address", "uint8"],
        [tokenInAddress, signer.address, withdrawMode], // tokenIn, to, withdraw mode
    );
    const steps = [{
        pool: poolAddress,
        data: swapData,
        callback: constants.AddressZero,
        callbackData: '0x',
    }];
    const paths = [{
        steps: steps,
        tokenIn: constants.AddressZero,
        amountIn: amount,
    }];
    const router = new Contract(routerAddress, routerAbi, signer);
    try {
        const response = await router.swap(
            paths, 
            0, 
            BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            {
                value: amount, // please uncomment this if your token in is ETH
                gasLimit: 14000000
            }
        );
        let tx = await response.wait();
        const delay = getRandomDelay();
        await Timeout.set(delay);
        console.log("Delay: ", delay, " seconds");
        console.log("Address: ", signer.address);
        console.log("ETH -> USDC");
        console.log("In ETH amount: ", amountForLog);
        console.log("tx hash: ", tx)
      } catch (error: any) {
        const delay = getRandomDelay();
        await Timeout.set(delay);
        console.log("Delay: ", delay, " seconds");
        console.log("Address: ", signer.address);
        console.log("ETH -> USDC");
        console.log("In ETH amount: ", amountForLog);
        console.error("Error: ", error);
      }
}

function randomInteger(min: number, max: number) {
    if(max === 0) {
        return 0;
    } else {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

async function getETHBalance(address: string) {
    const balance = await provider.getBalance(address);
    return Number(utils.formatEther(balance));
}

function getRandomAmountETH() {
    return Math.random() * (config.toAmount - config.fromAmount) + config.fromAmount;
}

function getRandomDelay() {
    return Math.random() * (config.toDelay - config.fromDelay) + config.fromDelay;
}

async function go() {
    if(config.fromDelay >= config.toDelay) {
        console.log("incorrect delay range");
        return;
    }
    if(config.fromAmount >= config.toAmount) {
        console.log("incorrect amount range");
        return;
    }
    if(config.randomMode) {
        const lengthArray = privates.length;
        for (let _i = 0; _i < lengthArray; _i++) {
            const r = randomInteger(0, privates.length - 1)
            const targetPrivate = privates[r];
            privates.splice(r, 1);
            await swap(targetPrivate);
        }
    } else {
        for (const privateKey of privates) {
            await swap(privateKey);
        }
    }
}

go()



