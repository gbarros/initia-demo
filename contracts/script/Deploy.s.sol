// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CampMamoTShirt.sol";

contract Deploy is Script {
    function run() external returns (CampMamoTShirt) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // The deployer of the script will become the initial owner
        // Address of the real IConnectOracle on the Initia network
        address oracleAddress = 0x031ECb63480983FD216D17BB6e1d393f3816b72F;
        CampMamoTShirt campMamoTShirt = new CampMamoTShirt(msg.sender, oracleAddress);

        vm.stopBroadcast();
        return campMamoTShirt;
    }
}
