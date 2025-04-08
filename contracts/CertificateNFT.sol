// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CertificateNFT is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Certificate {
        string studentName;
        string degree;
        string institution;
        string graduationDate;
        string ipfsHash;
        bool isValid;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(string => bool) public usedIpfsHashes;

    event CertificateIssued(
        uint256 indexed tokenId,
        string studentName,
        string degree,
        string institution
    );

    event CertificatesIssuedInBatch(uint256 batchSize);
    event CertificateRevoked(uint256 indexed tokenId);

    constructor() ERC721("University Certificate", "UCERT") {}

    function issueCertificate(
        address recipient,
        string memory studentName,
        string memory degree,
        string memory institution,
        string memory graduationDate,
        string memory ipfsHash
    ) public onlyOwner nonReentrant returns (uint256) {
        require(!usedIpfsHashes[ipfsHash], "IPFS hash already used");
        require(bytes(studentName).length > 0, "Student name cannot be empty");
        require(bytes(degree).length > 0, "Degree cannot be empty");
        require(bytes(institution).length > 0, "Institution cannot be empty");
        require(bytes(graduationDate).length == 10, "Use YYYY-MM-DD format");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(recipient, newTokenId);

        certificates[newTokenId] = Certificate({
            studentName: studentName,
            degree: degree,
            institution: institution,
            graduationDate: graduationDate,
            ipfsHash: ipfsHash,
            isValid: true
        });

        usedIpfsHashes[ipfsHash] = true;

        emit CertificateIssued(newTokenId, studentName, degree, institution);

        return newTokenId;
    }

    function issueCertificatesBatch(
        address[] memory recipients,
        string[] memory studentNames,
        string[] memory degrees,
        string[] memory institutions,
        string[] memory graduationDates,
        string[] memory ipfsHashes
    ) public onlyOwner nonReentrant returns (uint256[] memory) {
        uint256 batchSize = recipients.length;
        require(
            batchSize == studentNames.length &&
            batchSize == degrees.length &&
            batchSize == institutions.length &&
            batchSize == graduationDates.length &&
            batchSize == ipfsHashes.length,
            "Array lengths must match"
        );

        uint256[] memory tokenIds = new uint256[](batchSize);

        for (uint256 i = 0; i < batchSize; i++) {
            require(!usedIpfsHashes[ipfsHashes[i]], "IPFS hash already used");
            require(bytes(studentNames[i]).length > 0, "Student name cannot be empty");
            require(bytes(degrees[i]).length > 0, "Degree cannot be empty");
            require(bytes(institutions[i]).length > 0, "Institution cannot be empty");
            require(bytes(graduationDates[i]).length == 10, "Use YYYY-MM-DD format");

            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            tokenIds[i] = newTokenId;

            _mint(recipients[i], newTokenId);

            certificates[newTokenId] = Certificate({
                studentName: studentNames[i],
                degree: degrees[i],
                institution: institutions[i],
                graduationDate: graduationDates[i],
                ipfsHash: ipfsHashes[i],
                isValid: true
            });

            usedIpfsHashes[ipfsHashes[i]] = true;

            emit CertificateIssued(newTokenId, studentNames[i], degrees[i], institutions[i]);
        }

        emit CertificatesIssuedInBatch(batchSize);
        return tokenIds;
    }

    function getCertificate(uint256 tokenId) public view returns (Certificate memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }

    function verifyCertificate(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId) && certificates[tokenId].isValid;
    }

    function revokeCertificate(uint256 tokenId) public onlyOwner nonReentrant {
        require(_exists(tokenId), "Certificate does not exist");
        certificates[tokenId].isValid = false;
        emit CertificateRevoked(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return string(abi.encodePacked("ipfs://", certificates[tokenId].ipfsHash));
    }
} 