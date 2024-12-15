// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YearInReviewNFT is ERC721, Ownable {
    uint256 private _tokenIds;
    mapping(address => bool) public hasMinted;

    constructor() ERC721("Year In Review 2024", "YIR24") {}

    function mint(string memory tokenURI) public {
        require(!hasMinted[msg.sender], "Already minted");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        hasMinted[msg.sender] = true;
    }
} 