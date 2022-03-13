import { createContext, useContext, useEffect, ReactNode, useState } from 'react'
import Chain from 'types/Chain'
import Token from 'types/Token'
import ApiService from 'ApiService'

type Props = { children: ReactNode }
type ProviderValue = {
  fetchData: (walletAddress: string) => void
}
const DataContext = createContext<ProviderValue | undefined>(undefined)

export function DataProvider({ children }: Props) {
  const api = new ApiService()

  const [allChains, setAllChains] = useState<Chain[]>([])

  useEffect(() => {
    async function getAllChains() {
      const chains = await api.getAllChains()
      const processed = chains.data.items
        .filter((c) => !c.is_testnet)
        .map((c) => ({ id: c.chain_id, label: c.label.replace(' Mainnet', '') }))
      setAllChains(processed)
    }
    getAllChains()
  }, [])

  async function fetchData(walletAddress: string) {
    const tokenBalancesRequests: Promise<any>[] = []
    for (const chain of allChains) {
      tokenBalancesRequests.push(api.getTokenBalances(chain.id, walletAddress))
    }
    const tokenBalancesResponses = await Promise.all(tokenBalancesRequests)

    const nonZeroBalances = tokenBalancesResponses.filter(
      (chain) => !(chain.data.items.length === 1 && chain.data.items[0].balance === '0')
    )
    console.log(nonZeroBalances)

    const portfolioValueOverTimeRequests: Promise<any>[] = []
    for (const chain of nonZeroBalances) {
      portfolioValueOverTimeRequests.push(api.getPortfolioValueOverTime(chain.data.chain_id, walletAddress))
    }
    const portfolioValueOverTimeResponses = await Promise.all(portfolioValueOverTimeRequests)
    console.log(portfolioValueOverTimeResponses)

    const portfolioValueOverTime: any[] = []
    const chainEntries = allChains.map((chain) => [chain.label, 0])

    // populate array with 31 objects that look like { Ethereum: 0, Matic: 0 }
    for (let i = 0; i < 31; i++) {
      portfolioValueOverTime.push({
        ...Object.fromEntries(chainEntries),
      })
    }

    for (const chain of portfolioValueOverTimeResponses) {
      let chainTotal = 0
      const tokens = chain.data.items
      for (const token of tokens) {
        for (const day of token.holdings) {
          chainTotal += day.close.quote
        }
      }
    }
  }

  if (!allChains.length) {
    return null
  }

  return <DataContext.Provider value={{ fetchData }}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
