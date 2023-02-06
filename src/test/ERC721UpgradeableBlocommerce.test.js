const { ethers, upgrades } = require('hardhat');
const { expect } = require('chai');

describe('ERC721UpgradeableBlocommerce contract', () => {
  let ERC721UpgradeableBlocommerce;
  let _ERC721UpgradeableBlocommerce;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    ERC721UpgradeableBlocommerce = await ethers.getContractFactory(
      'ERC721UpgradeableBlocommerce',
    );
    _ERC721UpgradeableBlocommerce = await upgrades.deployProxy(
      ERC721UpgradeableBlocommerce,
      ['Blocommerce', 'BLOC', '1.0.0'],
      {
        initializer: 'InitializeERC721UpgradeableBlocommerce',
      },
    );

    await _ERC721UpgradeableBlocommerce.deployed();
  });

  describe('Upgradeable', () => {
    beforeEach(async () => {
      const ERC721UpgradeableBlocommerceV2 = await ethers.getContractFactory(
        'ERC721UpgradeableBlocommerceV2',
      );

      await upgrades.upgradeProxy(
        _ERC721UpgradeableBlocommerce.address,
        ERC721UpgradeableBlocommerceV2,
      );
      UpgradeableV2 = ERC721UpgradeableBlocommerceV2.attach(
        _ERC721UpgradeableBlocommerce.address,
      );
    });

    it('Should execute a new function once the contract is upgraded', async () => {
      const testID = 2;
      await UpgradeableV2.set(testID);
      expect(await UpgradeableV2.get()).to.equal(testID);
    });

    it('Should get the same stored values after the contract is upgraded', async () => {
      const uri = 'https:ipfs/blocommerce/erc721/id/';
      const tokenID = 1;
      const testID = 2;
      await _ERC721UpgradeableBlocommerce.connect(addr1).mint(tokenID, uri);
      expect(await _ERC721UpgradeableBlocommerce.tokenURI(tokenID)).to.equal(uri);
      expect(await _ERC721UpgradeableBlocommerce.owner()).to.equal(
        owner.address,
      );
      expect(await UpgradeableV2.tokenURI(1)).to.equal(uri);
      await UpgradeableV2.set(testID);
      expect(await UpgradeableV2.get()).to.equal(testID);
    });
  });

  describe('Deployement', () => {
    it('Should retirive the right owner of the contract.', async () => {
      expect(await _ERC721UpgradeableBlocommerce.owner()).to.equal(
        owner.address,
      );
    });

    it('Should fail if not the right owner of the contract.', async () => {
      expect(await _ERC721UpgradeableBlocommerce.owner()).to.not.equal(
        addr1.address,
      );
    });
  });

  describe('NFT Minting', () => {
    beforeEach(async () => {
      const tokenID = 1;
      const uri = 'https:ipfs/blocommecre/erc721/id/';
      await _ERC721UpgradeableBlocommerce.connect(addr1).mint(tokenID, uri);
    });

    it('Should allow to mint for everyone.', async () => {
      const tokenID = 2;
      const uri = 'https:ipfs/blocommecre/erc721/id/';
      expect(await _ERC721UpgradeableBlocommerce.connect(addr2).mint(tokenID, uri));
    });

    it('Should allow to mint for Contract owner.', async () => {
      const tokenID = 3;
      const uri = 'https:ipfs/blocommecre/erc721/id/';
      expect(await _ERC721UpgradeableBlocommerce.connect(owner).mint(tokenID, uri));
    });

    it('Should fail if uri is not in string', async () => {
      const tokenID = 4;
      const uri = 'https:ipfs/blocommecre/erc721/id/';
      expect(
        await _ERC721UpgradeableBlocommerce.connect(addr1).mint(tokenID, uri),
      ).to.not.equal(123);
    });

    it('Should return uri for exsistent NFT.', async () => {
      const uri = 'https:ipfs/blocommecre/erc721/id/';
      const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
        addr1.address,
      );
      expect(await _ERC721UpgradeableBlocommerce.tokenURI(tokenID)).to.equal(
        uri,
      );
    });

    it('Should fail for not owner of the NFT.', async () => {
      const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
        addr1.address,
      );
      expect(await _ERC721UpgradeableBlocommerce.ownerOf(tokenID)).to.not.equal(
        addr2.address,
      );
    });

    it('Should get creator of NFT.', async () => {
      const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
        addr1.address,
      );
      expect(await _ERC721UpgradeableBlocommerce.ownerOf(tokenID)).to.equal(
        addr1.address,
      );
    });

    it('Contract owner sshould not be the NFT owner if its not minted.', async () => {
      const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
        addr1.address,
      );
      expect(
        await _ERC721UpgradeableBlocommerce.balanceOf(owner.address),
      ).to.not.equal(tokenID);
    });

    describe('NFT Owner by Index', () => {
      it('Should return tokenOfOwnerByIndex', async () => {
        const owner = addr1.address;
        const index = 0;
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        expect(
          await _ERC721UpgradeableBlocommerce.tokenOfOwnerByIndex(owner, index),
        ).to.equal(tokenID);
      });

      it('Should revert if not existent token on index => tokenOfOwnerByIndex', async () => {
        const owner = addr1.address;
        const index = 1;
        await expect(
          _ERC721UpgradeableBlocommerce.tokenOfOwnerByIndex(owner, index),
        ).to.be.reverted;
      });

      it('Should retrun tokenByIndex', async () => {
        const index = 0;
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        expect(
          await _ERC721UpgradeableBlocommerce.tokenByIndex(index),
        ).to.equal(tokenID);
      });

      it('Should revert if not existent token on index => tokenByIndex', async () => {
        const index = 1;
        await expect(_ERC721UpgradeableBlocommerce.tokenByIndex(owner, index))
          .to.be.reverted;
      });
    });

    describe('NFT Metadata', () => {
      it('index', async () => {
        const owner = addr1.address;
        const index = 0;
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        // const result = await _ERC721UpgradeableBlocommerce.tokenOfOwnerByIndex(owner,index);

        expect(
          await _ERC721UpgradeableBlocommerce.tokenOfOwnerByIndex(owner, index),
        ).to.equal(tokenID);
      });
      it('Should update the metdada', async () => {
        const newUri = 'https:ipfs/blocommecre/erc721/id/testing/';
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        await _ERC721UpgradeableBlocommerce
          .connect(addr1)
          .updateMetadata(tokenID, newUri);
        expect(await _ERC721UpgradeableBlocommerce.tokenURI(tokenID)).to.equal(
          newUri,
        );
      });

      it('Should revert if not owner', async () => {
        const newUri = 'https:ipfs/blocommecre/erc721/id/testing/';
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        await expect(
          _ERC721UpgradeableBlocommerce
            .connect(addr2)
            .updateMetadata(tokenID, newUri),
        ).to.be.reverted;
      });

      it('Should revert even for the contract owner', async () => {
        const newUri = 'https:ipfs/blocommecre/erc721/id/testing/';
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        await expect(
          _ERC721UpgradeableBlocommerce
            .connect(owner)
            .updateMetadata(tokenID, newUri),
        ).to.be.reverted;
      });
    });

    describe('NFT Transfer', () => {
      it('Should transfer by the owner', async () => {
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        await _ERC721UpgradeableBlocommerce.connect(addr1)['safeTransferFrom(address,address,uint256)'](addr1.address, addr2.address, tokenID);
        expect(await _ERC721UpgradeableBlocommerce.ownerOf(tokenID)).to.equal(
          addr2.address,
        );
      });

      it('Should revert if not the owner', async () => {
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        await expect(
          _ERC721UpgradeableBlocommerce
            .connect(addr2)
            ['safeTransferFrom(address,address,uint256)'](addr1.address, addr2.address, tokenID)
        ).to.be.reverted;
      });

      it('Should revert if not owned NFT into their wallets', async () => {
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr2.address,
        );
        await expect(
          _ERC721UpgradeableBlocommerce
            .connect(addr2)
            ['safeTransferFrom(address,address,uint256)'](addr1.address, addr2.address, tokenID)
        ).to.be.reverted;
      });

      it('Should revert for non existent NFT', async () => {
        const tokenID = 123; // random tokenID which is not existent OR no one is the owner of it.
        await expect(
          _ERC721UpgradeableBlocommerce
            .connect(addr1)
            ['safeTransferFrom(address,address,uint256)'](addr1.address, addr2.address, tokenID)
        ).to.be.reverted;
      });
    });

    describe('NFT Burn', () => {
      it('Should burn by the owner', async () => {
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        await _ERC721UpgradeableBlocommerce.connect(addr1).burn(tokenID);
        expect(
          await _ERC721UpgradeableBlocommerce.balanceOf(addr1.address),
        ).to.equal(0);
      });

      it('Should revert for non existent NFT', async () => {
        const tokenID = 123; // random tokenID which is not existent OR no one is the owner of it.
        await expect(
          _ERC721UpgradeableBlocommerce.connect(addr2).burn(tokenID),
        ).to.be.reverted;
      });

      it('Should revert if not the owner', async () => {
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        await expect(
          _ERC721UpgradeableBlocommerce.connect(addr2).burn(tokenID),
        ).to.be.reverted;
      });

      it('Should revert even for the Contract owner', async () => {
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        await expect(
          _ERC721UpgradeableBlocommerce.connect(owner).burn(tokenID),
        ).to.be.reverted;
      });

      it('Should return the remaining ownership to zero if 1 minted & 1 burned', async () => {
        const tokenID = await _ERC721UpgradeableBlocommerce.balanceOf(
          addr1.address,
        );
        await _ERC721UpgradeableBlocommerce.connect(addr1).burn(tokenID);
        // As the transaction will be reverted if the creator of the nft minted 1 token and then burn it, So currently no tokens owned by him.
        await expect(_ERC721UpgradeableBlocommerce.ownerOf(tokenID)).to.be
          .reverted;
      });
    });
  });
});
