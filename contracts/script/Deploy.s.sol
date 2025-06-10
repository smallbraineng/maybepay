// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {MaybePay} from "../src/MaybePay.sol";

contract DeployMaybePay is Script {
    function run() public {
        vm.startBroadcast();
        MaybePay maybePay = new MaybePay(msg.sender);
        vm.stopBroadcast();
        console.log("MaybePay deployed at:", address(maybePay));
    }
}
