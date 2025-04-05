const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CertificateNFT contract...");

  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();

  await certificateNFT.waitForDeployment();

  console.log("CertificateNFT deployed to:", await certificateNFT.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 