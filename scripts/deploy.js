async function main() {
  const BatchTransfer = await ethers.getContractFactory("BatchTransfer");
  console.log("Deploying BatchTransfer...");
  const batchTransfer = await BatchTransfer.deploy();
  await batchTransfer.deployed();
  console.log("BatchTransfer deployed to:", batchTransfer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 