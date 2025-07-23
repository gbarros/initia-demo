// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/CampMamoTShirt.sol";
import "../test/MockOracle.sol";

contract DeployToAnvil is Script {
    function run() external returns (CampMamoTShirt, MockOracle) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the MockOracle
        MockOracle mockOracle = new MockOracle();
        console.log("MockOracle deployed to:", address(mockOracle));

        // 2. Set a mock price for TIA/USD
        uint256 mockTiaPrice = 10 * 1e18; // $10
        mockOracle.setPrice("TIA/USD", mockTiaPrice);
        console.log("Mock TIA/USD price set to: $10");

        // 3. Deploy the CampMamoTShirt contract, linking it to the mock oracle
        CampMamoTShirt campMamoTShirt = new CampMamoTShirt(msg.sender, address(mockOracle));
        console.log("CampMamoTShirt deployed to:", address(campMamoTShirt));

        vm.stopBroadcast();
        return (campMamoTShirt, mockOracle);
    }
}
