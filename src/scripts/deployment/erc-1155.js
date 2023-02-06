const { ethers, upgrades } = require('hardhat');

async function deployErc1155() {
  const ERC1155UpgradeableBlocommerce = await ethers.getContractFactory(
    'ERC1155UpgradeableBlocommerce',
  );

  const ERC1155UpgradeableBlocommerceProxy = await upgrades.deployProxy(
    ERC1155UpgradeableBlocommerce,
    ['Blocommerce', 'BLOC', '', '1.0.0'],
    {
      initializer: 'InitializeERC1155UpgradeableBlocommerce',
    },
  );

  await ERC1155UpgradeableBlocommerceProxy.deployed();
  const contractAddress = ERC1155UpgradeableBlocommerceProxy.address;

  return contractAddress;
}

module.exports = {
  deployErc1155,
};
