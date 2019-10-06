pragma solidity ^0.5.3;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";


contract DogToken is ERC20Detailed, ERC20Mintable, ERC20Burnable {
    
    constructor(string memory name, string memory symbol, uint8 decimals) ERC20Detailed(name, symbol, decimals) public {
    }
}
