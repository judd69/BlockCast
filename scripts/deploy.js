import hardhat from 'hardhat'

const { ethers } = hardhat

const candidates = [
  ['Maya Chen', 'Protocol & Governance'],
  ['Darius Cole', 'Community Growth'],
  ['Nadia Okafor', 'Treasury Stewardship'],
  ['Leo Martins', 'Developer Relations'],
]

async function main() {
  const names = candidates.map(([name]) => name)
  const roles = candidates.map(([, role]) => role)
  const factory = await ethers.getContractFactory('BlockCast')
  const contract = await factory.deploy(names, roles)
  await contract.waitForDeployment()
  console.log(`BlockCast deployed to: ${await contract.getAddress()}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})