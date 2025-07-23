// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "initia-evm-contracts/interfaces/IConnectOracle.sol";

/**
 * @title MockOracle
 * @dev Mocks the IConnectOracle for testing purposes.
 * Allows setting a custom price for any currency pair.
 */
contract MockOracle is IConnectOracle {
    // Mapping from the currency pair ID hash to its mock Price struct.
    mapping(bytes32 => Price) private _mockPrices;

    // The default price for TIA/USD, set to $2.50 with 18 decimals.
    uint256 public constant DEFAULT_TIA_PRICE = 2_500_000_000_000_000_000; // 2.5 * 1e18

    constructor() {
        // On deployment, set a default price for "TIA/USD".
        bytes32 tiaUsdHash = keccak256(abi.encodePacked("TIA/USD"));
        _mockPrices[tiaUsdHash] = Price({
            price: DEFAULT_TIA_PRICE,
            timestamp: block.timestamp,
            height: uint64(block.number),
            nonce: 1,
            decimal: 18,
            id: 1
        });
    }

    /**
     * @notice Returns the mock price for a given currency pair.
     * @dev Implements the get_price function from the IConnectOracle interface.
     */
    function get_price(string memory pair_id) external view override returns (Price memory) {
        bytes32 pairHash = keccak256(abi.encodePacked(pair_id));
        return _mockPrices[pairHash];
    }

    /**
     * @notice A helper function for tests to set or update the mock price.
     * @param pair_id The currency pair identifier (e.g., "TIA/USD").
     * @param newPrice The new price to set for the pair (with 18 decimals).
     */
    function setPrice(string memory pair_id, uint256 newPrice) external {
        bytes32 pairHash = keccak256(abi.encodePacked(pair_id));
        Price storage currentPrice = _mockPrices[pairHash];

        _mockPrices[pairHash] = Price({
            price: newPrice,
            timestamp: block.timestamp,
            height: uint64(block.number),
            nonce: currentPrice.nonce + 1,
            decimal: 18,
            id: currentPrice.id == 0 ? 1 : currentPrice.id
        });
    }

    /**
     * @notice Not needed for our tests, but required by the interface.
     */
    function get_all_currency_pairs() external pure override returns (string memory) {
        return "[\"TIA/USD\"]";
    }

    /**
     * @notice Not needed for our tests, but required by the interface.
     */
    function get_prices(string[] memory pair_ids) external view override returns (Price[] memory) {
        Price[] memory prices = new Price[](pair_ids.length);
        for (uint i = 0; i < pair_ids.length; i++) {
            prices[i] = this.get_price(pair_ids[i]);
        }
        return prices;
    }
}
