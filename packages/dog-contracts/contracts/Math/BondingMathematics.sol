pragma solidity ^0.5.4;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Convert.sol";


contract BondingMathematics {

    using Convert for bytes;
    using SafeMath for uint256;

    address public vyperMath;

    /*
    * @dev Contract Constructor
    *
    * @param _vyperMath address of Math vyper contract
    */
    constructor(address _vyperMath) public {
        vyperMath = _vyperMath;
    }
    
    /*
    * @dev function calcPurchase returns DOG tokens amount
    *
    * @param continuousTokenSupply uint256 continuous Token total supply
    * @param premintedMGL uint256 preminted DOG supply
    * @param daiAmount uint256 usd buying amount
    */
    function calcPurchase(uint256 continuousTokenSupply,
        uint256 premintedMGL,
        uint256 usdAmount,
        uint256 buySlope) public view returns (uint256){

        (bool success, bytes memory data) = vyperMath.staticcall(abi.encodeWithSignature("calc_purchase(uint256,uint256,uint256,uint256)", continuousTokenSupply, premintedMGL, usdAmount, buySlope));
        require(success);

        uint tokensAmount = data.toUint256();
        return tokensAmount;
    }
    
    /*
    * @dev function calcTokenSell returns usd amount
    *
    * @param continuousTokenSupply uint256 continuous Token total supply
    * @param reserveTokenSupply uint256 Reserve token total supply
    * @param _tokensAmount uint256 Tokens for sale
    */
    function calcTokenSell(uint256 continuousTokenSupply,
        uint256 reserveTokenSupply,
        uint256 _tokensAmount) public view returns (uint256){

        (bool success, bytes memory data) = vyperMath.staticcall(abi.encodeWithSignature("calc_sell(uint256,uint256,uint256)", continuousTokenSupply, reserveTokenSupply, _tokensAmount));
        require(success);

        uint usdAmount = data.toUint256();
        return usdAmount;
    }
    
    /*
    * @dev function calcExitFee returns penalty tax fee for closing the CO
    *
    * @param continuousTokenSupply uint256 continuous Token total supply
    * @param premintedMGL uint256 preminted DOG supply
    * @param reserveTokenSupply uint256 Reserve token total supply
    */
    function calcExitFee(uint256 continuousTokenSupply,
        uint256 premintedMGL,
        uint256 reserveTokenSupply) public view returns (uint256){
        
        (bool success, bytes memory data) = vyperMath.staticcall(abi.encodeWithSignature("calc_exit_fee(uint256,uint256,uint256)", continuousTokenSupply, premintedMGL, reserveTokenSupply));
        require(success);
        
        uint exitFee = data.toUint256();
        return exitFee;
    }
}
