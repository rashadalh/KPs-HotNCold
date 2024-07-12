// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import { Token } from "../src/erc20.sol";
import { Standard_Token } from "../src/erc20.sol";
import { Ioracle } from "../src/oracle.sol";
import { oracle } from "../src/oracle.sol";
import { kpmarket } from "../src/marketplace.sol";
import { IMarket } from "../src/marketplace.sol";
import { IHeatOption } from "../src/heatOption.sol";

contract DeployHeatMarket is Script {
    function run() external {
        // load private key from dotenv
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 user1PrivateKey = vm.envUint("USER_1");
        uint256 user2PrivateKey = vm.envUint("USER_2");
        uint256 user3PrivateKey = vm.envUint("USER_3");
        uint256 user4PrivateKey = vm.envUint("USER_4");


        vm.startBroadcast(deployerPrivateKey);


        oracle oracle_ = new oracle();
        address oracleAddress = address(oracle_);

        // Deploy the HeatToken contract
        Standard_Token kp = new Standard_Token(
            100_000_000_000 * 10**18,   // Initial supply of 100,000,000,000 tokens with 18 decimals
            "KATYPERRY",                 // Token name
            18,                     // Decimals
            "KP"                    // Token symbol
        );
        address kpAddress = address(kp);
        console.log("kpAddress", kpAddress);

        // Deploy the HeatMarket contract
        kpmarket market_ = new kpmarket(
            kpAddress,  // address of the HeatToken contract
            oracleAddress  // address of the oracle contract
        );
        address marketAddr = address(market_);

        // remove if you want to deploy to mainnet
        payable(0x1D7607a314BeD674BBd99B46469005f8Baead6cD).transfer(10 ether);

        // let's deploy a heat option to start
        IHeatOption ny1 = IHeatOption(market_.deployHeatOption(
            msg.sender,  // owner of the option
            oracleAddress,  // arbitrator
            oracleAddress,  // oracle
            block.number + 3600,  // strike price
            69,  // strike price
            "New York"
        ));
        IHeatOption ny2 = IHeatOption(market_.deployHeatOption(
            msg.sender,  // owner of the option
            oracleAddress,  // arbitrator
            oracleAddress,  // oracle haa
            block.number + 3600 + 3600,  // strike price
            69,  // strike price
            "New York"
        ));
        IHeatOption ny3 = IHeatOption(market_.deployHeatOption(
            msg.sender,  // owner of the option
            oracleAddress,  // arbitrator
            oracleAddress,  // oracle
            block.number + 3600 + 3600 + 3600,  // strike price
            69,  // strike price
            "New York"
        ));
        IHeatOption la1 = IHeatOption(market_.deployHeatOption(
            msg.sender,  // owner of the option
            oracleAddress,  // arbitrator
            oracleAddress,  // oracle
            block.number + 200,  // current block + 100
            78,  // strike price
            "Los Angeles"
        ));
        IHeatOption la2 = IHeatOption(market_.deployHeatOption( 
            msg.sender,  // owner of the option
            oracleAddress,  // arbitrator
            oracleAddress,  // oracle
            block.number + 320,  // current block + 100
            78,  // strike price
            "Los Angeles"
        ));
        IHeatOption lo1 = IHeatOption(market_.deployHeatOption(
            msg.sender,  // owner of the option
            oracleAddress,  // arbitrator
            oracleAddress,  // oracle
            block.number + 800,  // current block + 100
            62,  // strike price
            "London"
        ));
        IHeatOption lo2 = IHeatOption(market_.deployHeatOption(
            msg.sender,  // owner of the option
            oracleAddress,  // arbitrator
            oracleAddress,  // oracle
            block.number + 1200,  // current block + 100
            62,  // strike price
            "London"
        ));


        console.log("Market Address: ",marketAddr);

        vm.stopBroadcast();

        vm.startBroadcast(user1PrivateKey);
        address u1 = vm.createWallet(user1PrivateKey).addr;

        kp.mint(u1, 100_000 * 10**18);

        kp.approve(address(ny1), 100_000 * 10**18);
        kp.approve(address(ny2), 100_000 * 10**18);
        kp.approve(address(ny3), 100_000 * 10**18);
        ny1.betYes(u1, 100 * 10**18);
        ny2.betNo(u1, 300 * 10**18);
        ny3.betYes(u1, 800 * 10**18);

        kp.approve(address(la1), 100_000 * 10**18);
        kp.approve(address(la2), 100_000 * 10**18);
        la1.betNo(u1, 1000 * 10**18);
        la2.betYes(u1, 1000 * 10**18);


        kp.approve(address(lo1), 100_000 * 10**18);
        kp.approve(address(lo2), 100_000 * 10**18);
        lo1.betNo(u1, 1000 * 10**18);
        lo2.betYes(u1, 1000 * 10**18);

        vm.stopBroadcast();

        vm.startBroadcast(user2PrivateKey);
        address u2 = vm.createWallet(user2PrivateKey).addr;

        kp.mint(u2, 100_000 * 10**18);

        kp.approve(address(ny1), 100_000 * 10**18);
        kp.approve(address(ny2), 100_000 * 10**18);
        kp.approve(address(ny3), 100_000 * 10**18);
        ny1.betNo(u2, 300 * 10**18);
        ny2.betYes(u2, 100 * 10**18);
        ny3.betYes(u2, 300 * 10**18);

        kp.approve(address(la1), 100_000 * 10**18);
        kp.approve(address(la2), 100_000 * 10**18);
        la1.betYes(u2, 1200 * 10**18);
        la2.betNo(u2, 800 * 10**18);


        kp.approve(address(lo1), 100_000 * 10**18);
        kp.approve(address(lo2), 100_000 * 10**18);
        lo1.betYes(u2, 1200 * 10**18);
        lo2.betNo(u2, 2000 * 10**18);

        vm.stopBroadcast();

        vm.startBroadcast(user3PrivateKey);
        address u3 = vm.createWallet(user3PrivateKey).addr;

        kp.mint(u3, 100_000 * 10**18);

        kp.approve(address(ny1), 100_000 * 10**18);
        kp.approve(address(ny2), 100_000 * 10**18);
        kp.approve(address(ny3), 100_000 * 10**18);
        ny1.betYes(u3, 800 * 10**18);
        ny2.betYes(u3, 200 * 10**18);
        ny3.betYes(u3, 500 * 10**18);

        kp.approve(address(la1), 100_000 * 10**18);
        kp.approve(address(la2), 100_000 * 10**18);
        la1.betYes(u3, 900 * 10**18);
        la2.betYes(u3, 1300 * 10**18);


        kp.approve(address(lo1), 100_000 * 10**18);
        kp.approve(address(lo2), 100_000 * 10**18);
        lo1.betYes(u3, 200 * 10**18);
        lo2.betYes(u3, 100 * 10**18);

        vm.stopBroadcast();

        vm.startBroadcast(user4PrivateKey);
        address u4 = vm.createWallet(user4PrivateKey).addr;

        kp.mint(u4, 100_000 * 10**18);

        kp.approve(address(ny1), 100_000 * 10**18);
        kp.approve(address(ny2), 100_000 * 10**18);
        kp.approve(address(ny3), 100_000 * 10**18);
        ny1.betNo(u4, 1300 * 10**18);
        ny2.betNo(u4, 100 * 10**18);
        ny3.betNo(u4, 500 * 10**18);

        kp.approve(address(la1), 100_000 * 10**18);
        kp.approve(address(la2), 100_000 * 10**18);
        la1.betNo(u4, 1900 * 10**18);
        la2.betNo(u4, 200 * 10**18);


        kp.approve(address(lo1), 100_000 * 10**18);
        kp.approve(address(lo2), 100_000 * 10**18);
        lo1.betNo(u4, 400 * 10**18);
        lo2.betNo(u4, 400 * 10**18);

        vm.stopBroadcast();
    }
}