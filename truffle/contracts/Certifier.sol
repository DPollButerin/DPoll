// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;


/*
FAKE CONTRACT to test eligibility
in order to respect deadline, I didn't implement a real contract as we need to make more researches
about our solutions and the best way to implement them :
-checking off chain and having a BDD with a hash of the proof, 
-or using DID, proof of KYC...
This contract will list certifiers, methods, store valid certifications (to not have to check again)/ log with events
It will receive a list of conditions and check if the address is eligible 

At the moment the function checkEligibility simulates the check of the conditions and always return a valid result
*/

contract Certifier {

    event CertificationEvent(address indexed certifier, bytes32 indexed subject, bytes32 indexed proof, bytes32 method);

    struct Certification {
        address certifier;
        bytes32 subject;
        bytes32 proof;
        bytes32 method;
        // uint256 timestamp;
    }

    function getEligibilityProof(string calldata _criteria, address _who) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("I claim this address is certified" ));
    }
    function checkEligibility(string calldata _criteria, address _who) external returns (Certification memory) {
        Certification memory certification;
        certification.certifier = address(this);
        certification.subject = keccak256(abi.encodePacked(_who, _criteria));
        certification.proof = getEligibilityProof( _criteria,  _who);
        certification.method = keccak256(abi.encodePacked("fake method"));
        // certification.timestamp = block.timestamp;
        emit CertificationEvent(certification.certifier, certification.subject, certification.proof, certification.method);
        return certification;
    }

}