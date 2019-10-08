pragma solidity ^0.5.4;

contract IDogOrganisation {

    event Invest(address investor, uint256 amount);
    event Withdraw(address investor, uint256 amount);
    event UnlockOrganisation(address unlocker, uint256 initialAmount, uint256 initialDogSupply);
    event DividendPayed(address payer, uint256 amount);
    event CloseOrganisation(uint256 taxPenalty);
    

    function setDogOrgAdminAddress(address _newdogOrgAdmin) public;

    function invest(uint256 usdAmount) public;
    
    function sell(uint256 _amountDOG) public;
    
    function calcUSDForDog(uint256 _amountDOG) public view returns(uint256);
    
    function calcDogForUSD(uint256 usdAmount) public view returns(uint256);
    
    function calcUSDToReturn(uint256 dogTokenAmount) public view returns(uint256);
    
    function payDividends(uint256 dividendAmount, uint8 dividendRatio)  public;
    
    function unlockOrganisation(uint256 organiserUSDContribution, uint256 organiserDOGReward) public;
    
    function closeOrganisation() public;
    
    function calcCloseTaxPenalty() public view returns(uint256);
}
