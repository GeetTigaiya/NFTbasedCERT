import { ethers } from "hardhat";

async function main() {
  console.log("Seeding demo certificates...");

  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();
  await certificateNFT.deployed();

  console.log("CertificateNFT deployed to:", certificateNFT.address);

  // Demo data
  const demoCertificates = [
    {
      recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      studentName: "John Doe",
      degree: "Bachelor of Science in Computer Science",
      institution: "Ethereum University",
      graduationDate: "2023-05-15",
      ipfsHash: "bafkreiakwg4tnxfafn56hqpc5un5tzmjtykfiq6xrlvxq6klbzjxgejavq" // Replace with actual IPFS hash
    }
    // ,
    // {
    //   recipient: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    //   studentName: "Jane Smith",
    //   degree: "Master of Engineering",
    //   institution: "Blockchain Institute",
    //   graduationDate: "2023-08-20",
    //   ipfsHash: "QmDemo2" // Replace with actual IPFS hash
    // },
    // {
    //   recipient: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    //   studentName: "Alice Johnson",
    //   degree: "PhD in Cryptography",
    //   institution: "Web3 University",
    //   graduationDate: "2023-12-10",
    //   ipfsHash: "QmDemo3" // Replace with actual IPFS hash
    // }
  ];

  // Issue certificates
  for (const cert of demoCertificates) {
    const tx = await certificateNFT.issueCertificate(
      cert.recipient,
      cert.studentName,
      cert.degree,
      cert.institution,
      cert.graduationDate,
      cert.ipfsHash
    );
    await tx.wait();
    console.log(`Issued certificate to ${cert.studentName}`);
  }

  console.log("Demo certificates seeded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 