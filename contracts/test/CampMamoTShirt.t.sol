// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CampMamoTShirt.sol";
import "./MockOracle.sol";
import "openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";


contract CampMamoTShirtTest is Test, IERC721Receiver {
    CampMamoTShirt public campMamoTShirt;
    MockOracle public mockOracle;

    address public constant USER = address(0x1);
    uint256 public constant MINT_PRICE_TIA = 1 ether; // Corresponds to T-shirt price of $20 and TIA price of $20

    function setUp() public {
        // 1. Deploy the MockOracle
        mockOracle = new MockOracle();

        // 2. Set the mock TIA price to $20 for easy calculation (20 * 1e18)
        mockOracle.setPrice("TIA/USD", 20 * 1e18);

        // 3. Deploy the CampMamoTShirt contract, linking it to the mock oracle
        campMamoTShirt = new CampMamoTShirt(address(this), address(mockOracle));

        // 4. Give the user some funds to test with
        vm.deal(USER, 10 ether);
    }

    function test_MintWithCorrectPrice() public {
        // The user wants to mint a T-shirt
        vm.startPrank(USER);

        // The T-shirt is $20, and the mock oracle says TIA is $20.
        // Therefore, the price is exactly 1 TIA (1 * 1e18).
        uint256 priceInTia = (campMamoTShirt.TSHIRT_PRICE_USD() * 1e18) / mockOracle.get_price("TIA/USD").price;
        assertEq(priceInTia, 1 ether, "Price calculation should be 1 TIA");

        // The user calls the mint function with the correct amount
        campMamoTShirt.mint{value: priceInTia}(USER);

        // Verify that the user now owns 1 T-shirt NFT
        assertEq(campMamoTShirt.balanceOf(USER), 1, "User should own one NFT");

        vm.stopPrank();
    }

    function test_FailMintWithInsufficientPrice() public {
        vm.startPrank(USER);

        // The user tries to mint with less than the required amount
        uint256 insufficientAmount = 0.5 ether;

        // Expect the transaction to revert with the correct error message
        vm.expectRevert("Not enough TIA sent");
        campMamoTShirt.mint{value: insufficientAmount}(USER);

        vm.stopPrank();
    }

    function test_ConstructorMintsTenNFTs() public {
        // The constructor should have minted 10 NFTs to the deployer (address(this))
        assertEq(campMamoTShirt.balanceOf(address(this)), 10, "Owner should have 10 NFTs after deployment");

        // The next token ID to be minted should be 10. We can infer this by checking
        // the owner of token ID 9 and that token ID 10 doesn't exist yet.
        assertEq(campMamoTShirt.ownerOf(9), address(this), "Owner of token 9 should be the deployer");
        vm.expectRevert(abi.encodeWithSignature("ERC721NonexistentToken(uint256)", 10));
        campMamoTShirt.ownerOf(10);
    }

    // Function to allow the test contract to receive NFTs
    function onERC721Received(
        address, // operator
        address, // from
        uint256, // tokenId
        bytes memory // data
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
