// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// heat option solidity contract.
import {Ioracle} from "./oracle.sol";
import {NoReentrancy} from "./noReentrancy.sol";
import {Token} from "./erc20.sol";

interface IHeatOption {
    function betYes(address _bettor, uint256 num_tokens) external;
    function betNo(address _bettor, uint256 num_tokens) external;
    function arbitrate(bool winnerIsYES) external;
    function exerciseOption() external;
    function withdrawPayoutYES(address _bettor) external;
    function withdrawPayoutNO(address _bettor) external;
}

contract heatOption is IHeatOption, NoReentrancy {
    address public heatToken; // address of the HT token
    address public owner; // address of the owner of the option
    address public heatOracle; // address of the oracle that will provide the price of the asset
    address public arbitrator; // address of the arbitrator that will resolve disputes
    uint256 public expiryBlock; // block number when the option expires
    uint256 public strikePrice; // price at which the option can be exercised
    uint256 public arbitrationPeriod = 18000; // number of blocks after expiry when the option can be disputed
    bool public exercised; // flag to check if the option has been exercised
    bool public arbitrationPeriodFinished; // flag to check if the arbitration period has finished

    bool public winnerIsYES; // flag to check if the winner is YES

    // NOTE: bets are made in HT tokens.
    mapping(address => uint256) public balancesYES; // mapping of addresses to balances betting YES
    mapping(address => uint256) public balancesNO; // mapping of addresses to balances betting NO

    uint256 public totalYES; // total amount of HT tokens bet on YES
    uint256 public totalNO; // total amount of HT tokens bet on NO

    uint256 public location; // location of the asset

    constructor (address _heatToken, address _owner, address _arbitrator, address _heatOracle, uint256 _expiryBlock, uint256 _strikePrice, uint256 _location) {
        heatToken = _heatToken;
        owner = _owner;
        arbitrator = _arbitrator;
        heatOracle = _heatOracle;
        expiryBlock = _expiryBlock;
        strikePrice = _strikePrice;
        location = _location;


        winnerIsYES = false; // default value

        // check that expiry block is in the future
        require(expiryBlock > block.number, "Expiry block is in the past");

        // check that the strike price is greater than zero
        require(strikePrice > 0, "Strike price is less than or equal to zero");

        // make sure arbitration period > 0
        require(arbitrationPeriod > 0, "Arbitration period is less than or equal to zero");
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only the arbitrator can call this function");
        _;
    }

    function betYes(address _bettor, uint256 num_tokens) public noReentrancy {
        // check if the option has not been exercised
        require(!exercised, "Option has already been exercised");

        // check if the option has not expired
        require(block.number < expiryBlock, "Option has expired");

        // check if the sender has enough HT tokens
        require(Token(heatToken).balanceOf(msg.sender) >= num_tokens, "Not enough HT tokens");

        // transfer the HT tokens to this contract
        Token(heatToken).transferFrom(msg.sender, address(this), num_tokens);

        // update the balance of the sender
        balancesYES[_bettor] += num_tokens;

        // update the total amount of HT tokens bet on YEaS
        totalYES += num_tokens;
    }

    function betNo(address _bettor, uint256 num_tokens) public noReentrancy {
        // check if the option has not been exercised
        require(!exercised, "Option has already been exercised");

        // check if the option has not expired
        require(block.number < expiryBlock, "Option has expired");

        // check if the sender has enough HT tokens
        require(Token(heatToken).balanceOf(msg.sender) >= num_tokens, "Not enough HT tokens");

        // transfer the HT tokens to this contract
        Token(heatToken).transferFrom(msg.sender, address(this), num_tokens);

        // update the balance of the sender
        balancesNO[_bettor] += num_tokens;

        // update the total amount of HT tokens bet on NO
        totalNO += num_tokens;
    }

    // arbitrator can arbitrate the option only during the arbitration period
    // even if the option has already been exercised
    function arbitrate(bool _winnerIsYES) public onlyArbitrator noReentrancy {
        // check if the option has expired
        require(block.number > expiryBlock, "Option has not expired yet");

        // check if the arbitration period has finished
        require(block.number < expiryBlock + arbitrationPeriod, "Arbitration period has finished");

        // set the winner
        winnerIsYES = _winnerIsYES;

        // set the option as exercised
        exercised = true;
    }

    function exerciseOption() public noReentrancy {
        // check if option is not yet expired
        require(!exercised, "Option has already been exercised");
        
        // check if the option has expired
        require(block.number > expiryBlock, "Option has not expired yet");

        // Check if YES Won (price of the asset is greater than the strike price)
        if (Ioracle(heatOracle).getTemperature(location) > strikePrice) {
            winnerIsYES = true;
        }
        exercised = true;
    }

    // function to transfer portion of winnings to the winner calling this function
    function withdrawPayoutYES(address _bettor) onlyOwner noReentrancy public {
        // check if the option has been exercised
        require(exercised, "Option has not been exercised yet");

        // check if the arbitration period has finished
        require(block.number > expiryBlock + arbitrationPeriod, "Arbitration period has not finished yet");

        // check if the winner is YES
        require(winnerIsYES, "Winner is NO");

        // check if the winner is calling this function
        require(balancesYES[_bettor] > 0, "You are not the winner");

        // compute winner payout
        // this is the total amount of HT tokens that were bet on NO + the total amount of HT tokens that were bet on YES x the percentage of the total amount of HT tokens that were bet on YES by the winner

        // transfer the payout to the winner
        // calculate total YES and NO balances

        // compute winner payout
        uint256 winnerPayout = (totalNO + totalYES) * balancesYES[_bettor] / totalYES;

        // transfer the payout to the winner
        balancesYES[_bettor] = 0;
        Token(heatToken).transfer(_bettor, winnerPayout);

        // decrese the total amount of HT tokens bet on YES
        if (totalYES > winnerPayout) {
            totalYES -= winnerPayout;
        } else {
            totalYES = 0;
        }
    }

    function withdrawPayoutNO(address _bettor) public noReentrancy {
        // check if the option has been exercised
        require(exercised, "Option has not been exercised yet");

        // check if the arbitration period has finished
        require(block.number > expiryBlock + arbitrationPeriod, "Arbitration period has not finished yet");

        // check if the winner is NO
        require(!winnerIsYES, "Winner is YES");

        // check if the winner is calling this function
        require(balancesNO[_bettor] > 0, "You are not the winner");

        // compute winner payout
        // this is the total amount of HT tokens that were bet on YES + the total amount of HT tokens that were bet on NO x the percentage of the total amount of HT tokens that were bet on NO by the winner

        // transfer the payout to the winner
        // calculate total YES and NO balances

        // compute winner payout
        uint256 winnerPayout = (totalNO + totalYES) * balancesNO[_bettor] / totalNO;

        // transfer the payout to the winner
        balancesNO[_bettor] = 0;
        Token(heatToken).transfer(_bettor, winnerPayout);

        // decrese the total amount of HT tokens bet on NO
        if (totalNO > winnerPayout) {
            totalNO -= winnerPayout;
        } else {
            totalNO = 0;
        }
    }
}