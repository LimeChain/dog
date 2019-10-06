pragma solidity ^0.5.4;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./Tokens/dogToken/DogToken.sol";
import "./Math/BondingMathematics.sol";


contract DogOrganisation is Ownable {

    using SafeMath for uint256;
    
    BondingMathematics public bondingMath;

    IERC20 public dogUSD;
    DogToken public dogToken;

    address public dogBank;
    address public dogOrgAdmin;
    
    uint256 public premintedMGL = 0;
    
    uint256 constant public USD_RESERVE_REMAINDER = 5; // 20%
    
    uint256 public buySlope;
    
    enum State {
        LOCKED,
        LIVE,
        CLOSED
    }
    
    State public dogOrgState;
    
    /*
    * Modifiers
    */
    modifier onlyWhenLive() {
        require(dogOrgState == State.LIVE, "onlyWhenLive :: The Organisation is not live");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == dogOrgAdmin, "onlyAdmin :: msg sender is not the admin");
        _;
    }
    
    /*
    * Events
    */
    event Invest(address investor, uint256 amount);
    event Withdraw(address investor, uint256 amount);
    event UnlockOrganisation(address unlocker, uint256 initialAmount, uint256 initialMglSupply);
    event DividendPayed(address payer, uint256 amount);
    event CloseOrganisation(uint256 taxPenalty);
    
    /*
    * @dev Contract Constructor
    *
    * @param _bondingMath Address of contract calculating bonding mathematics based on sqrt
    * @param _dogUSD Address of USD Token
    * @param _dogBank Address of dog Bank
    * @param _name of the dog token
    * @param _symbol of the dog token
    * @param _decimals of the dog token
    */
    constructor(address _bondingMath, uint256 _buySlope, address _dogUSD, address _dogBank, string memory _name, string memory _symbol, uint8 _decimals) public {
        
        require(_dogUSD != address(0), "constructor:: dog USD address is required");
        require(_dogBank != address(0), "constructor:: dog Bank address is required");
        require(_bondingMath != address(0), "constructor:: Bonding Math address is required");
        require(_buySlope > 0, "The buy slope must be greater than zero");

        buySlope = _buySlope;
        dogToken = new DogToken(_name, _symbol, _decimals);
        dogUSD = IERC20(_dogUSD);

        dogBank = _dogBank;
        dogOrgAdmin = msg.sender;
        bondingMath = BondingMathematics(_bondingMath);
    }
    
    /*
    * @dev function setDogOrgAdminAddress - Possibility to change contract administrator address
    */
    function setDogOrgAdminAddress(address _newdogOrgAdmin) public onlyAdmin {
        require(_newdogOrgAdmin != address(0), "dogOrgAdminAddress :: invalid address");
        dogOrgAdmin = _newdogOrgAdmin;
    }
    
    /**
    * @dev function invest - Allows investors to invest in dog Tokens. The amount of received tokens is calculated based ot bonding mathematics
    *
    * @param usdAmount uint256 The amount of invested USD Tokens
    */
    function invest(uint256 usdAmount) public onlyWhenLive {
        require(dogUSD.balanceOf(address(this)) > 0, "invest:: Organisation is not unlocked for investments yet");
        require(dogUSD.allowance(msg.sender, address(this)) >= usdAmount, "invest:: Investor tries to invest with unapproved USD amount");
        
        uint256 mglTokensToMint = calcRelevantMGLForUSD(usdAmount);

        uint256 reserveUSDAmount = usdAmount.div(USD_RESERVE_REMAINDER);
        dogUSD.transferFrom(msg.sender, address(this), reserveUSDAmount);
        dogUSD.transferFrom(msg.sender, dogBank, usdAmount.sub(reserveUSDAmount));

        dogToken.mint(msg.sender, mglTokensToMint);
        
        emit Invest(msg.sender, usdAmount);
    }
    
    /*
    * @dev function revokeInvestment Allows investors to sell their dog Tokens
    *
    * @param _amountMGL uint256 The amount of dog Tokens investor wants to sell
    */
    function sell(uint256 _amountMGL) public {
        require(dogToken.allowance(msg.sender, address(this)) >= _amountMGL, "revokeInvestment:: Investor wants to withdraw MGL without allowance");
    
        uint256 usdToReturn = calcUSDToReturn(_amountMGL);
    
        dogUSD.transfer(msg.sender, usdToReturn);
        dogToken.burnFrom(msg.sender, _amountMGL);
    
        emit Withdraw(msg.sender, usdToReturn);
    }
    
    function calcUSDToReturn(uint256 _amountMGL) public view returns(uint256){
        if (dogOrgState == State.LIVE) {
            return bondingMath.calcTokenSell(dogToken.totalSupply(), dogUSD.balanceOf(address(this)), _amountMGL);
        } else if(dogOrgState == State.CLOSED) {
            return dogUSD.balanceOf(address(this)).mul(_amountMGL).div(dogToken.totalSupply());
        }
    }
    
    /*
    * @dev function calcRelevantMGLForUSD Uses bonding mathematics to calculate dog Tokens purchase
    *
    * @param usdAmount uint256 USD used to buy dog Tokens
    */
    function calcRelevantMGLForUSD(uint256 usdAmount) public view returns(uint256) {
        uint256 tokensAfterPurchase = bondingMath.calcPurchase(dogToken.totalSupply(), premintedMGL, usdAmount, buySlope);
        return tokensAfterPurchase;
    }
    
    /*
    * @dev function calcRelevantUSDForMGL Uses bonding mathematics to calculate dog Tokens sell
    *
    * @param coTokenAmount uint256 dog tokens to sell
    */
    function calcRelevantUSDForMGL(uint256 coTokenAmount) public view returns(uint256) {
        return bondingMath.calcTokenSell(dogToken.totalSupply(), dogUSD.balanceOf(address(this)), coTokenAmount);
    }
    
    /*
    * @dev function payDividends Allows to send dividends back to the dog bank and CO reserve increasing the dog Token price
    *
    * @param dividendAmount uint256 USD Token amount payed back
    * @param dividendRatio uint8 The rate that tokens should be split between dog Bank and CO reserve
    */
    function payDividends(uint256 dividendAmount, uint8 dividendRatio)  public onlyWhenLive {
        require(dividendRatio <= 100, "dividendRatio is higher than maximum allowed");
        require(dogUSD.balanceOf(address(this)) > 0, "payDividends:: Organisation is not unlocked for dividends payment yet");
        require(dogUSD.allowance(msg.sender, address(this)) >= dividendAmount, "payDividends:: payer tries to pay with unapproved amount");
        
        uint256 reserveAmount = (dividendAmount.mul(dividendRatio)).div(100);
        
        dogUSD.transferFrom(msg.sender, address(this), reserveAmount);
        dogUSD.transferFrom(msg.sender, dogBank, dividendAmount.sub(reserveAmount));
        
        emit DividendPayed(msg.sender, dividendAmount);
    }
    
    /*
    * @dev function unlockOrganisation initiate Continuous organisation
    *
    * @param organiserUSDContribution USD amount
    * @param organiserMGLReward initial dog Tokens supply
    */
    function unlockOrganisation(uint256 organiserUSDContribution, uint256 organiserMGLReward) public onlyOwner {
        require(dogOrgState == State.LOCKED);
        require(dogUSD.balanceOf(address(this)) == 0, "unlockOrganisation:: Organization is already unlocked");
        require(dogUSD.allowance(msg.sender, address(this)) >= organiserUSDContribution, "unlockOrganisation:: Unlocker tries to unlock with unapproved amount");

        dogUSD.transferFrom(msg.sender, address(this), organiserUSDContribution.div(USD_RESERVE_REMAINDER));
        dogUSD.transferFrom(msg.sender, dogBank, organiserUSDContribution.sub(organiserUSDContribution.div(USD_RESERVE_REMAINDER)));

        premintedMGL = organiserMGLReward;
        
        dogToken.mint(msg.sender, organiserMGLReward);
    
        dogOrgState = State.LIVE;
        
        emit UnlockOrganisation(msg.sender, organiserUSDContribution, organiserMGLReward);
    }
    
    /*
    * @dev function closeOrganisation Cancels the CO and allows investors to restore their investments
    */
    function closeOrganisation() public onlyOwner onlyWhenLive {
        uint256 taxPenalty = calcCloseTaxPenalty();
        
        require(dogUSD.allowance(msg.sender, address(this)) >= taxPenalty, "closeOrganisation :: Owner tries to close organisation with unapproved USD amount");

        dogUSD.transferFrom(msg.sender, address(this), taxPenalty);

        dogOrgState = State.CLOSED;

        emit CloseOrganisation(taxPenalty);
    }
    
    /*
    * @dev function calcCloseTaxPenalty Returns closing tax in USD
    */
    function calcCloseTaxPenalty() public view returns(uint256) {
        return bondingMath.calcExitFee(dogToken.totalSupply(), premintedMGL, dogUSD.balanceOf(address(this)));
    }
    
}
