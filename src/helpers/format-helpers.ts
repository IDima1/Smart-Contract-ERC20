import { BN } from '@distributedlab/tools'

export function formatBalance(balance: BN, decimals: number): string {
  const bnBalance = BN.fromBigInt(balance, decimals)
  const formattedBalance = bnBalance.format({
    decimals: 0,
    groupSeparator: '',
  })

  return formattedBalance
}
