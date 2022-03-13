import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useData } from 'context/DataContext'

export default function PortfolioValueOverTime() {
  // const data = [
  //   {
  //     date: new Date('2022-03-12T00:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  //     Ethereum: 4000,
  //     Matic: 3000,
  //     'Avalanche C-Chain': 2000,
  //   },
  //   {
  //     date: new Date('2022-03-12T00:00:00Z').toLocaleDateString(),
  //     Ethereum: 1000,
  //     Matic: 4000,
  //     'Avalanche C-Chain': 3000,
  //   },
  //   {
  //     date: new Date('2022-03-12T00:00:00Z').toLocaleDateString(),
  //     Ethereum: 4000,
  //     Matic: 3000,
  //     'Avalanche C-Chain': 3000,
  //   },
  // ]
  const { portfolioValueOverTime, nonEmptyChainIDs, chainIDsToLabels } = useData()
  const portfolioData = portfolioValueOverTime

  return (
    <AreaChart
      width={500}
      height={400}
      data={portfolioData}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      {/* <Area type="monotone" dataKey="Ethereum" stroke="#8884d8" fill="#8884d8" name="blah" />
      <Area type="monotone" dataKey="Matic" stroke="#82ca9d" fill="#82ca9d" />
      <Area type="monotone" dataKey="Avalanche C-Chain" stroke="#ffc658" fill="#ffc658" /> */}
      {nonEmptyChainIDs.map((id) => (
        <Area key={id} type="monotone" dataKey={chainIDsToLabels[id]} stroke="#ffc658" fill="#ffc658" />
      ))}
    </AreaChart>
  )
}
