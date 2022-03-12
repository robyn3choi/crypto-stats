import ApiService from 'ApiService'
import { useState } from 'react'

export default function Home() {
  const api = new ApiService()

  const [walletAddress, setWalletAddress] = useState<string>('')

  async function getTokenBalances() {
    const res = await api.getTokenBalances(walletAddress)
    console.log(res)
  }

  return (
    <div>
      <input
        placeholder="Enter your wallet address"
        onChange={(e) => setWalletAddress(e.target.value)}
        value={walletAddress}
      />
      <button onClick={getTokenBalances}>Go!</button>
    </div>
  )
}
