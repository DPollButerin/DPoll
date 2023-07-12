// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;


//fake contract for testing eligibility
//in order to respect deadline, I didn't implement a real contract as we need to make more researches
//about our solutions and the best way to implement them :
//checking off chain and having a BDD with a hash of the proof, 
//or using DID, proof of KYC...
//This contract will list certifiers, methods, store valid certifications (to not have to check again)/ log with events
//It will receive a list of conditions and check if the address is eligible 

//at the moment the function checkEligibility simulate the check of the conditions and always return true


contract Certifier {

    event CertificationEvent(address indexed certifier, bytes32 indexed proof, bytes32 indexed method);

    struct Certification {
        address certifier;
        bytes32 proof;
        bytes32 method;
        // uint256 timestamp;
    }

    function checkEligibility(string[] calldata _criteria, address _who) public returns (Certification memory cerrtification) {
        Certification memory certification;
        certification.certifier = address(this);
        certification.proof = keccak256(abi.encodePacked("I claim hthis address is certified" ));
        certification.method = keccak256(abi.encodePacked("fake method"));
        // certification.timestamp = block.timestamp;
        emit CertificationEvent(certification.certifier, certification.proof, certification.method);
        return cerrtification;
    }
}