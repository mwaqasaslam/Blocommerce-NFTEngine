const { ethers, upgrades } = require('hardhat');

async function deployErc721() {
  const ERC721UpgradeableBlocommerce = await ethers.getContractFactory(
    'ERC721UpgradeableBlocommerce',
  );

  const ERC721UpgradeableBlocommerceProxy = await upgrades.deployProxy(
    ERC721UpgradeableBlocommerce,
    ['Blocommerce', 'BLOC', '1.0.0'],
    {
      initializer: 'InitializeERC721UpgradeableBlocommerce',
    },
  );

  await ERC721UpgradeableBlocommerceProxy.deployed();
  const contractAddress = ERC721UpgradeableBlocommerceProxy.address;

  return contractAddress;
}

module.exports = {
  deployErc721,
};
