pragma solidity ^0.5.4;


import "./BasicDogOrganisation.sol";

contract BasicDogRegistry {

    address[] public organisations;
    mapping(address=>string) public nameOf;
    address public bondingMathAddress;

    event OrganisationCreated(address organisationAddress, string name);

    constructor(address _bondingMathAddress) public {
        bondingMathAddress = _bondingMathAddress;
    }

    function createNewOrganisation(uint256 _reserveRatioPercent, uint256 _buySlope, address _dogUSD, address _dogBank, string memory _name, string memory _symbol, uint8 _decimals) public {
        address newOrg = address(new BasicDogOrganisation(msg.sender, bondingMathAddress, _reserveRatioPercent, _buySlope, _dogUSD, _dogBank, _name, _symbol, _decimals));
        organisations.push(newOrg);
        nameOf[newOrg] = _name;
        emit OrganisationCreated(newOrg, _name);
    }

    function organisationsCount() public view returns(uint256) {
        return organisations.length;
    }
    
}
