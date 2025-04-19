// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.29;

import {Test, console} from "forge-std/Test.sol";
import {MaybePay} from "../src/MaybePay.sol";

contract MaybePayTest is Test {
    MaybePay public maybePay;
    bytes32 public constant TEST_COMMITMENT = keccak256(abi.encodePacked(uint256(0), uint256(123)));

    function setUp() public {
        maybePay = new MaybePay({sender: address(this)});
    }

    function test_OwnerSet() public view {
        assertEq(maybePay.owner(), address(this));
    }

    function test_OrderPlacement() public {
        uint256 price = 1 ether;
        maybePay.placeOrder{value: 2 ether}({price: price});

        (uint256 value, uint256 orderPrice, address buyer, MaybePay.Status status) = maybePay.orders(0);

        assertEq(value, 2 ether);
        assertEq(orderPrice, price);
        assertEq(buyer, address(this));
        assertEq(uint256(status), uint256(MaybePay.Status.PENDING));
    }

    function test_OrderProcessing() public {
        address owner = address(0xcafe);
        maybePay.transferOwnership({newOwner: owner});

        address buyer = address(0xface);
        vm.deal(buyer, 1 ether);

        uint256 price = 1 ether;
        vm.prank(buyer);
        maybePay.placeOrder{value: 1 ether}({price: price});

        vm.startPrank(owner);
        maybePay.setCommitment({id: 0, commitment: TEST_COMMITMENT});
        maybePay.processOrder({id: 0, ownerRng: 123});
        vm.stopPrank();

        (,,, MaybePay.Status status) = maybePay.orders(0);
        assertTrue(status == MaybePay.Status.PAID);
    }

    function testRevertsWhen_NonOwnerSetCommitment() public {
        vm.prank(address(1));
        vm.expectRevert();
        maybePay.setCommitment({id: 0, commitment: TEST_COMMITMENT});
    }
}
