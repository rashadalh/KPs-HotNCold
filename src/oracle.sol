// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// simple contract to act as a temperature oracle

interface Ioracle {
    function setTemperature(uint256 _location, uint256 _temperature) external;
    function getTemperature(uint256 _location) external view returns (uint256);
}

contract oracle is Ioracle {
    address public owner;
    mapping(uint256 => uint256) public tempMap; 

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function setTemperature(uint256 _location, uint256 _temperature) external override onlyOwner() {
        tempMap[_location] = _temperature;
    }

    function getTemperature(uint256 _location) external view override returns (uint256) {
        return tempMap[_location];
    }

    // constructor
    constructor(){
        owner = msg.sender;
    }
}