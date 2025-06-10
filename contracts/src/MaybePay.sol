// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.30;

import {Owned} from "solmate/auth/Owned.sol";

contract MaybePay is Owned {
    // types
    enum Status {
        PAID,
        FREE,
        PENDING
    }

    struct Order {
        uint256 value;
        uint256 price;
        address buyer;
        Status status;
    }

    // events
    event OrderPlaced(uint256 id, uint256 value, uint256 price, address buyer);
    event OrderProcessed(uint256 id, Status status);

    // state
    uint256 public orderIndex;
    mapping(uint256 => bytes32) public rngCommitments;
    mapping(uint256 => Order) public orders;

    // constructor
    constructor(address sender) Owned(sender) {}

    // public: owner
    function setCommitment(uint256 id, bytes32 commitment) public onlyOwner {
        require(rngCommitments[id] == bytes32(0), "commitment already set");
        require(commitment != bytes32(0), "invalid commitment");
        rngCommitments[id] = commitment;
    }

    function processOrder(uint256 id, uint256 ownerRng) public onlyOwner {
        Order storage order = orders[id];
        require(order.status == Status.PENDING, "order not pending");
        require(keccak256(abi.encodePacked(id, ownerRng)) == rngCommitments[id], "invalid rng");
        uint256 rng = uint256(keccak256(abi.encodePacked(id, ownerRng, order.value)));
        Status status = getStatus({value: order.value, price: order.price, rng: rng});
        order.status = status;

        if (status == Status.PAID) {
            payable(this.owner()).transfer(order.value);
        } else if (status == Status.FREE) {
            payable(order.buyer).transfer(order.value);
        }

        emit OrderProcessed(id, status);
    }

    // public: everyone
    function placeOrder(uint256 price) public payable {
        uint256 value = msg.value;
        require(value >= price, "value must be geq price");
        require(price > 0, "price must be greater than 0");
        orders[orderIndex] = Order({buyer: msg.sender, value: value, price: price, status: Status.PENDING});
        orderIndex++;

        emit OrderPlaced(orderIndex, value, price, msg.sender);
    }

    // helpers
    function getStatus(uint256 value, uint256 price, uint256 rng) public pure returns (Status) {
        return price > (rng % value) ? Status.PAID : Status.FREE;
    }
}
