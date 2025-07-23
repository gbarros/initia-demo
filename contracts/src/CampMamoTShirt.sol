// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "initia-evm-contracts/interfaces/IConnectOracle.sol";

contract CampMamoTShirt is ERC721, Ownable {
    uint256 public constant TSHIRT_PRICE_USD = 20 * 1e18; // 20 USD with 18 decimals
    address public constant TIA_ADDRESS = 0x0000000000000000000000000000000000000001; // Placeholder for TIA address
    IConnectOracle public oracle;

    uint256 private _nextTokenId;

    constructor(address initialOwner, address oracleAddress) ERC721("Camp Mamo T-Shirt", "CMT") Ownable(initialOwner) {
        oracle = IConnectOracle(oracleAddress);

        // Pre-mint the 10 T-shirt designs for the contract itself
        for (uint256 i = 0; i < 10; i++) {
            _safeMint(address(this), _nextTokenId++);
        }
    }

    function getPriceInTia() public returns (uint256) {
        uint256 tiaUsdPrice = getTiaPrice();
        return (TSHIRT_PRICE_USD * 1e18) / tiaUsdPrice;
    }

    function buy(uint256 tokenId) public payable {
        // Check that the contract still owns the token
        require(ownerOf(tokenId) == address(this), "Token not available for sale");
        
        uint256 priceInTia = getPriceInTia();
        require(msg.value >= priceInTia, "Not enough TIA sent");

        // Transfer the token from the contract to the buyer
        _transfer(address(this), msg.sender, tokenId);
    }

    function getTiaPrice() public returns (uint256) {
        IConnectOracle.Price memory price = oracle.get_price("TIA/USD");
        return price.price;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }
}
