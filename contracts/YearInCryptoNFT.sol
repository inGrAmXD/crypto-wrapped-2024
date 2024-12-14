// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract YearInCryptoNFT is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 private _tokenIds;
    mapping(address => bool) public hasMinted;
    uint256 public mintStartDate;
    string public baseURI;
    
    // Mapping para almacenar los atributos del NFT
    mapping(uint256 => string) private _tokenAttributes;

    constructor(uint256 _mintStartDate) ERC721("YearInCrypto2024", "YIC24") {
        mintStartDate = _mintStartDate;
    }

    function mint(string memory attributes) external {
        require(block.timestamp >= mintStartDate, "Minting hasn't started yet");
        require(!hasMinted[msg.sender], "Already minted");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(msg.sender, newTokenId);
        _tokenAttributes[newTokenId] = attributes;
        hasMinted[msg.sender] = true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        return string(abi.encodePacked(
            baseURI,
            tokenId.toString(),
            "?attributes=",
            _tokenAttributes[tokenId]
        ));
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }
} 