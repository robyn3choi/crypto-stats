import { createContext, useContext, useEffect, ReactNode, useState } from 'react'
import Chain from 'types/Chain'
import Token from 'types/Token'
import ApiService from 'ApiService'

type Props = { children: ReactNode }
type ProviderValue = {
  fetchData: (walletAddress: string) => void
  portfolioValueOverTime: any
  nonEmptyChainIDs: string[]
  chainIDsToLabels: any
}
const DataContext = createContext<ProviderValue | undefined>(undefined)

export function DataProvider({ children }: Props) {
  const api = new ApiService()

  const [chainIDsToLabels, setChainIDsToLabels] = useState<any>(null)
  const [nonEmptyChainIDs, setNonEmptyChainIDs] = useState<string[]>([])
  const [suspiciousTokens, setSuspiciousTokens] = useState<Token[]>([])
  const [portfolioValueOverTime, setPortfolioValueOverTime] = useState<any>([])

  useEffect(() => {
    async function getAllChains() {
      const chains = await api.getAllChains()
      const mainnets = chains.data.items.filter((c) => !c.is_testnet)
      const _chainIDsToLabels = {}
      mainnets.forEach((chain) => {
        _chainIDsToLabels[chain.chain_id] = chain.label.replace(' Mainnet', '')
      })
      setChainIDsToLabels(_chainIDsToLabels)
    }
    getAllChains()
  }, [])

  async function fetchData(walletAddress: string) {
    const tokenBalancesRequests: Promise<any>[] = []
    //TODO: remove this
    let counter = 0
    for (const chainId of Object.keys(chainIDsToLabels)) {
      //if (counter > 6) break
      tokenBalancesRequests.push(api.getTokenBalances(chainId, walletAddress))
      // counter++
    }
    const tokenBalancesResponses = await Promise.all(tokenBalancesRequests)

    const nonZeroBalances = tokenBalancesResponses.filter(
      (chain) => !(chain.data.items.length === 1 && chain.data.items[0].balance === '0')
    )
    console.log(nonZeroBalances)

    setNonEmptyChainIDs(nonZeroBalances.map((b) => b.data.chain_id))

    const portfolioValueOverTimeRequests: Promise<any>[] = []
    for (const chain of nonZeroBalances) {
      portfolioValueOverTimeRequests.push(api.getPortfolioValueOverTime(chain.data.chain_id, walletAddress))
    }
    const portfolioValueOverTimeResponses = await Promise.all(portfolioValueOverTimeRequests)
    console.log(portfolioValueOverTimeResponses)

    const _portfolioValueOverTime: any[] = []
    const chainEntries = Object.keys(chainIDsToLabels).map((id) => [id, 0])

    // populate array with 31 objects that look like { Ethereum: 0, Matic: 0 }
    for (let i = 0; i < 31; i++) {
      _portfolioValueOverTime.push({
        ...Object.fromEntries(chainEntries),
      })
    }

    for (const chain of portfolioValueOverTimeResponses) {
      const tokens = chain.data.items
      for (const token of tokens) {
        // exclude invalid tokens
        if (!token.contract_name || token.holdings[0].close.quote_rate === null) continue
        if (isTokenSuspicious(token)) {
          setSuspiciousTokens((prevState) => [
            ...prevState,
            { name: token.contract_name, symbol: token.contract_ticker_symbol },
          ])
          continue
        }
        for (let i = 0; i < 31; i++) {
          if (!_portfolioValueOverTime[i].date) {
            _portfolioValueOverTime[i].date = new Date(token.holdings[i].timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
          }
          _portfolioValueOverTime[i][chain.data.chain_id] += token.holdings[i].close.quote
          if (chain.data.chain_id === 250 && i === 0) {
            console.log(_portfolioValueOverTime[i][chain.data.chain_id])
          }
        }
      }
    }
    setPortfolioValueOverTime(_portfolioValueOverTime)
    console.log(_portfolioValueOverTime)
  }

  function isTokenSuspicious(token) {
    const balance = Math.round(token.holdings[0].close.balance / Math.pow(10, token.contract_decimals))
    // for example, if the balance is 2345, modulus would be 1000
    const modulus = Math.pow(10, balance.toString().length - 1)
    const isBalanceLargeCleanNumber = balance >= 10000 && balance % modulus === 0
    return isBalanceLargeCleanNumber
  }

  if (!chainIDsToLabels) {
    return null
  }

  return (
    <DataContext.Provider value={{ fetchData, portfolioValueOverTime, nonEmptyChainIDs, chainIDsToLabels }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
