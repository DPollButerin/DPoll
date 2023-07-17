// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollStorage.sol";


contract DPollMember is DPollStorage {
    //eth balance of the DAO
   
   //creer un vault dedie pour permettre implementation stacking, 2nd couche de reward...sur token natif en plus de DPT

    function grantRole(address _memberAddress, MemberRole _role) public onlyOwner {
        members[_memberAddress].role = _role;
    }

    function revokeRole(address _memberAddress) public onlyOwner {
        members[_memberAddress].role = MemberRole.GUEST;
    }

    function addMember( address _memberAddress) public payable {
        require(msg.value >= DAO_MEMBERSHIP_FEE, "You need to send at least 0.1 ether");
        require(members[_memberAddress].role == MemberRole.GUEST, "You are already a member");
        Member memory newMember;
        newMember.memberAddress = _memberAddress;
        newMember.memberSince = block.timestamp;
        newMember.role = MemberRole.MEMBER;
        DAObalance += msg.value;
    }

    //not owner mais membres
    function removeMember(address _memberAddress) public onlyOwner {
        require(members[_memberAddress].role == MemberRole.MEMBER, "You are not a member");
        uint amount = members[_memberAddress].balance;
        (bool success, ) = payable(_memberAddress).call{value: amount}("");
        delete members[_memberAddress];
        //update balance => DPT to DAO // eth send back to member
    }

    function revokeMembership(address _memberAddress) public onlyOwner {
        require(members[_memberAddress].role == MemberRole.MEMBER, "You are not a member");
        delete members[_memberAddress];
        //update balance => DPT to DAO // eth send back to member
    }
}