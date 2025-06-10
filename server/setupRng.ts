import { randomBytes } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import {
  http,
  type Address,
  type Hex,
  createPublicClient,
  createWalletClient,
  encodePacked,
  keccak256,
  parseAbi,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'

export type RngData = {
  count: number
  numbers: string[]
}

const main = async () => {
  const privateKey = process.argv[2] as Hex
  const chainId = Number.parseInt(process.argv[3] as string)
  const contractAddress = process.argv[4] as Address
  const n = Number.parseInt(process.argv[5] as string)

  if (!privateKey || !chainId || !contractAddress || !n || n <= 0) {
    console.log(
      'usage: bun setupRng.ts <private_key> <chain_id> <contract_address> <number_of_orders>'
    )
    process.exit(1)
  }

  const chain = Object.values(chains).find((c) => c.id === chainId)
  if (!chain) {
    console.log(`chain id ${chainId} not found`)
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey)
  const walletClient = createWalletClient({
    chain,
    transport: http(),
    account,
  })
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  })

  const abi = parseAbi([
    'function setCommitment(uint256 id, bytes32 commitment) external',
  ])

  const rngNumbers: bigint[] = []

  for (let i = 0; i < n; i++) {
    const randomValue = randomBytes(32)
    const rngNumber = BigInt(`0x${randomValue.toString('hex')}`)
    rngNumbers.push(rngNumber)

    const commitment = keccak256(
      encodePacked(['uint256', 'uint256'], [BigInt(i), rngNumber])
    )

    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: 'setCommitment',
      args: [BigInt(i), commitment],
    })

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
    })

    if (receipt.status === 'reverted') {
      console.error(`Transaction failed for order ${i}`)
      process.exit(1)
    }

    console.log(`committed rng for order ${i}`)
  }

  const rngData: RngData = {
    count: n,
    numbers: rngNumbers.map((num) => num.toString()),
  }

  writeFileSync('rng.json', JSON.stringify(rngData, null, 2))
  console.log(`committed ${n} rng values onchain and saved to rng.json`)
}

main()
