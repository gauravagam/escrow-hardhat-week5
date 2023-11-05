// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "hardhat/console.sol";

contract Escrow {
	address public arbiter;
	address public beneficiary;
	address public depositor;
	uint public value;

	bool public isApproved;

	constructor(address _arbiter, address _beneficiary) payable {
		arbiter = _arbiter;
		beneficiary = _beneficiary;
		depositor = msg.sender;
		value = msg.value;
	}

	event Approved(uint);

	function approve() external {
		require(msg.sender == arbiter);
		uint balance = address(this).balance;
		(bool sent, ) = payable(beneficiary).call{value: balance}("");
 		require(sent, "Failed to send Ether");
		emit Approved(balance);
		isApproved = true;
	}

	fallback() external payable{

	}

	receive() external payable{

	}

	event Cancel(uint);

	function cancel() external {
		require(msg.sender==arbiter);
		uint balance = address(this).balance;
		console.log('balance',balance);
		(bool sent,bytes memory data) = payable(depositor).call{value: balance}("");
		console.log('sent',sent);
		console.logBytes(data);
		require(sent,"Failed to send ether to depositor");
		emit Cancel(balance);
	}

	function getIsApproved() external view returns(bool){
		return isApproved;
	}
}
