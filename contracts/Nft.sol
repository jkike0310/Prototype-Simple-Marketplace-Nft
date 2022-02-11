// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Nft is ERC721, ERC721Enumerable {
  uint public supply;
  string public baseTokenURI = "https://raw.githubusercontent.com/jkike0310/NftCollectionEx/main/";  
  mapping (uint256 => string) private _tokenURIs;
  constructor() ERC721("NFT Cards Tag", "TWNft") {}

  // Override so the openzeppelin tokenURI() method will use this method to create the full tokenURI instead
    function _baseURI() internal view virtual override returns (string memory) {
     return baseTokenURI;
  }    

  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
  
  function mint(string memory _tokenURI) public payable
  {
    _mint(msg.sender, supply);
    _setTokenURI(supply, _tokenURI);
    supply  += 1;
    
  }
   
   function setBaseURI(string memory baseURI) public 
   {
        baseTokenURI = baseURI;
   }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory tokenURI_ = _tokenURIs[tokenId];
       
        return string(tokenURI_);
    }

    function tokensOfOwner(address addr) public view returns(uint256[] memory) {
        uint256 tokenCount = balanceOf(addr);
        uint256[] memory tokensId = new uint256[](tokenCount);
        for(uint256 i; i < tokenCount; i++){
            tokensId[i] = tokenOfOwnerByIndex(addr, i);
        }
        return tokensId;
    }


  function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable)
  {
    super._beforeTokenTransfer(from, to, tokenId);
  }
}