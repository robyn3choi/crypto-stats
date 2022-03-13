import axios, { AxiosRequestConfig } from 'axios'

const covalentHost = 'https://api.covalenthq.com/v1/'

export default class ApiService {
  getAllChains() {
    return this.getFromCovalent(`chains/`)
  }

  getTokenBalances(chainId: string, walletAddress: string) {
    return this.getFromCovalent(`${chainId}/address/${walletAddress}/balances_v2/`)
  }

  getPortfolioValueOverTime(chainId: string, walletAddress: string) {
    return this.getFromCovalent(`${chainId}/address/${walletAddress}/portfolio_v2/`)
  }

  async getFromCovalent(endpoint: string) {
    try {
      const res = await axios(
        covalentHost + endpoint,
        // @ts-ignore
        { auth: { username: process.env.NEXT_PUBLIC_COVALENT_API_KEY } }
      )
      return res.data
    } catch (err) {
      // TODO: show error in UI
      console.error(err)
    }
  }
}
