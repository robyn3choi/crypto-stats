import { useEffect, useState } from 'react'
import { useData } from 'context/DataContext'
import PortfolioValueOverTime from 'components/PortfolioValueOverTime'

export default function Home() {
  const { fetchData } = useData()
  const [walletAddress, setWalletAddress] = useState<string>('')

  return (
    <div>
      <input
        placeholder="Enter your wallet address"
        onChange={(e) => setWalletAddress(e.target.value)}
        value={walletAddress}
      />
      <button onClick={() => fetchData(walletAddress)} disabled={!walletAddress}>
        Go!
      </button>
      <PortfolioValueOverTime />
    </div>
  )
}
