// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import { IHeatOption } from "./heatOption.sol";
import { heatOption } from "./heatOption.sol";
import { NoReentrancy } from "./noReentrancy.sol";

import { Token } from "./erc20.sol";

interface IMarket {
    function deployHeatOption(address _owner, address _arbitrator, address _heatOracle, uint256 _expiryBlock, uint256 _strikePrice, string memory _locationName) external returns(address);
    function betYesOnHeatOption(address _optionAddress, uint256 num_tokens) external;
    function betNoOnHeatOption(address _optionAddress, uint256 num_tokens) external;
    function arbitrateHeatOption(address _optionAddress, bool winnerIsYES) external;
    function exerciseHeatOption(address _optionAddress) external;
    function withdrawPayoutYES(address _optionAddress) external;
    function withdrawPayoutNO(address _optionAddress) external;
}


// Prediction Marketplace for Heat Options....
contract kpmarket is IMarket, NoReentrancy {
    address public owner;
    address public heatToken;
    address public heatOracle;

    // array of addresses
    address[] public heatOptions;
    mapping (address=>uint256) hoIndexes;
    mapping (uint256=>uint256) locationIntToIndex;
    mapping (string=>uint256) locationStringToIndex;
    mapping (string=>uint256[]) locationNameToHoIndicies;
    string[] public locations;


    constructor(address _heatToken, address _heatOracle) {
        owner = msg.sender;
        heatToken = _heatToken;
        heatOracle = _heatOracle;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier addressExistsInHeatOptions(address _optionAddress) {
        require(hoIndexes[_optionAddress] != 0, "Heat Option does not exist");
        _;
    }

    function deployHeatOption(address _owner, address _arbitrator, address _heatOracle, uint256 _expiryBlock, uint256 _strikePrice, string calldata  _locationName) public onlyOwner noReentrancy returns(address) {
        if (!locationExists(_locationName)) {
            locations.push(_locationName);
            locationStringToIndex[_locationName] = locations.length - 1;
        }

        heatOptions.push(address(new heatOption(heatToken, _owner, _arbitrator, _heatOracle, _expiryBlock, _strikePrice, locations.length - 1)));
        hoIndexes[heatOptions[heatOptions.length - 1]] = heatOptions.length - 1;
        locationNameToHoIndicies[_locationName].push(hoIndexes[heatOptions[heatOptions.length - 1]]);
        return heatOptions[heatOptions.length - 1];
    }

    function locationExists(string calldata _locationName) private view returns(bool exists) {
        for (uint256 i = 0; i < locations.length; i++) {
            if (keccak256(abi.encodePacked(locations[i])) == keccak256(abi.encodePacked(_locationName))) {
                exists = true;
                break;
            }
        }
        return exists;
    }

    function betYesOnHeatOption(address _optionAddress, uint256 num_tokens) public noReentrancy addressExistsInHeatOptions(_optionAddress) {
        IHeatOption(_optionAddress).betYes(msg.sender, num_tokens);
    }

    function betNoOnHeatOption(address _optionAddress, uint256 num_tokens) public noReentrancy addressExistsInHeatOptions(_optionAddress) {
        IHeatOption(_optionAddress).betNo(msg.sender, num_tokens);
    }

    function arbitrateHeatOption(address _optionAddress, bool winnerIsYES) public noReentrancy {
        IHeatOption(_optionAddress).arbitrate(winnerIsYES);
    }

    function exerciseHeatOption(address _optionAddress) public noReentrancy onlyOwner {
        IHeatOption(_optionAddress).exerciseOption();
    }

    function withdrawPayoutYES(address _optionAddress) public noReentrancy {
        IHeatOption(_optionAddress).withdrawPayoutYES(msg.sender);
    }

    function withdrawPayoutNO(address _optionAddress) public noReentrancy {
        IHeatOption(_optionAddress).withdrawPayoutNO(msg.sender);
    }

    function getHeatOptions() public view returns(address[] memory) {
        return heatOptions;
    }

    function getHeatOptionsByLocation(string calldata _location) public view returns(address[] memory) {
        address[] memory hos = new address[](locationNameToHoIndicies[_location].length);
        for (uint256 i = 0; i < locationNameToHoIndicies[_location].length; i++) {
            hos[i] = heatOptions[locationNameToHoIndicies[_location][i]];
        }
        return hos;
    }

    function getLocations() public view returns(string[] memory) {
        return locations;
    }   
}