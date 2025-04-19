// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.29;

import {Test, console} from "forge-std/Test.sol";
import {MaybePay} from "../src/MaybePay.sol";

contract OrderTest is Test {
    MaybePay public maybePay;
    address public owner;
    address public buyer;

    function setUp() public {
        owner = address(0xcafe);
        buyer = address(0xface);

        maybePay = new MaybePay(address(this));
        maybePay.transferOwnership(owner);

        vm.deal(buyer, 100 ether);
        vm.deal(owner, 1 ether);
    }

    function test_CannotProcessOrderTwice() public {
        vm.prank(buyer);
        maybePay.placeOrder{value: 1 ether}(0.5 ether);

        bytes32 commitment = keccak256(abi.encodePacked(uint256(0), uint256(123)));

        vm.startPrank(owner);
        maybePay.setCommitment(0, commitment);
        maybePay.processOrder(0, 123);

        vm.expectRevert("order not pending");
        maybePay.processOrder(0, 123);
        vm.stopPrank();
    }

    function test_OrderPaidStatusPayment() public {
        uint256 startingBalance = owner.balance;

        vm.prank(buyer);
        maybePay.placeOrder{value: 1 ether}(1 ether);

        bytes32 commitment = keccak256(abi.encodePacked(uint256(0), uint256(123)));

        vm.startPrank(owner);
        maybePay.setCommitment(0, commitment);
        maybePay.processOrder(0, 123);
        vm.stopPrank();

        (,,, MaybePay.Status status) = maybePay.orders(0);
        assertEq(uint256(status), uint256(MaybePay.Status.PAID));
        assertEq(owner.balance, startingBalance + 1 ether);
    }

    function test_OrderFreeStatusPayment() public {
        uint256 startingBalance = buyer.balance;

        vm.prank(buyer);
        maybePay.placeOrder{value: 1 ether}(0.1 ether);

        bytes32 commitment = keccak256(abi.encodePacked(uint256(0), uint256(999)));

        vm.startPrank(owner);
        maybePay.setCommitment(0, commitment);
        maybePay.processOrder(0, 999);
        vm.stopPrank();

        (,,, MaybePay.Status status) = maybePay.orders(0);
        assertEq(uint256(status), uint256(MaybePay.Status.FREE));
        assertEq(buyer.balance, startingBalance);
    }

    function test_OrderParametersSet() public {
        vm.prank(buyer);
        maybePay.placeOrder{value: 2 ether}(1 ether);

        (uint256 value, uint256 price, address orderBuyer, MaybePay.Status status) = maybePay.orders(0);

        assertEq(value, 2 ether);
        assertEq(price, 1 ether);
        assertEq(orderBuyer, buyer);
        assertEq(uint256(status), uint256(MaybePay.Status.PENDING));
    }
}
