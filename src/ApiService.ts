import axios from 'axios'

export default class ApiService {
  async getTokenBalances(walletAddress: string) {
    try {
      // this is just a test endpoint
      const res = await axios(
        `https://api.covalenthq.com/v1/1/address/${walletAddress}/balances_v2/
      `,
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
