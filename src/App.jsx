import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserProvider, Contract } from 'ethers'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
const CONTRACT_ABI = [
  'function getCandidates() view returns (tuple(uint256 id, string name, string role, uint256 voteCount)[])',
  'function hasVoted(address) view returns (bool)',
  'function vote(uint256 candidateId)',
  'event VoteCast(address indexed voter, uint256 indexed candidateId)',
]

const fallbackCandidates = [
  { id: 0, name: 'Maya Chen', role: 'Protocol & Governance', voteCount: 0 },
  { id: 1, name: 'Darius Cole', role: 'Community Growth', voteCount: 0 },
  { id: 2, name: 'Nadia Okafor', role: 'Treasury Stewardship', voteCount: 0 },
  { id: 3, name: 'Leo Martins', role: 'Developer Relations', voteCount: 0 },
]

function shortAddress(address) { return `${address.slice(0, 6)}...${address.slice(-4)}` }

export default function App() {
  const [account, setAccount] = useState('')
  const [candidates, setCandidates] = useState(fallbackCandidates)
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('')
  const [isVoting, setIsVoting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  const totalVotes = useMemo(() => candidates.reduce((sum, item) => sum + Number(item.voteCount), 0), [candidates])
  const leadingCandidate = [...candidates].sort((a, b) => Number(b.voteCount) - Number(a.voteCount))[0]

  function syncCandidates(nextCandidates) {
    setCandidates(nextCandidates.map((item) => ({ ...item, id: Number(item.id), voteCount: Number(item.voteCount) })))
  }

  function countLocalVote() {
    setCandidates((previous) => previous.map((candidate) => candidate.id === selected
      ? { ...candidate, voteCount: Number(candidate.voteCount) + 1 }
      : candidate))
    setHasVoted(true)
    setConfirmed(true)
    setStatus('Demo mode: your vote has been counted locally. Add VITE_CONTRACT_ADDRESS to save it on-chain.')
  }

  async function connectWallet() {
    if (!window.ethereum) { setStatus('Install MetaMask to connect your wallet.'); return }
    try {
      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      setAccount(accounts[0])
      setStatus('')
      if (CONTRACT_ADDRESS) {
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        setHasVoted(await contract.hasVoted(accounts[0]))
        const nextCandidates = await contract.getCandidates()
        syncCandidates(nextCandidates)
      } else {
        setStatus('No contract connected. Local demo mode is active.')
      }
    } catch (error) { setStatus(error.shortMessage || 'Wallet connection was cancelled.') }
  }

  async function castVote() {
    if (selected === null) { setStatus('Select a candidate first.'); return }
    if (!CONTRACT_ADDRESS) {
      countLocalVote()
      return
    }
    if (!account) { await connectWallet(); if (!account) return }
    try {
      setIsVoting(true); setStatus('Waiting for wallet approval...')
      const provider = new BrowserProvider(window.ethereum)
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, await provider.getSigner())
      const transaction = await contract.vote(selected)
      setStatus('Vote submitted. Waiting for confirmation...')
      await transaction.wait()
      setHasVoted(true); setConfirmed(true); setStatus('Your vote is permanently recorded on-chain.')
      const refreshed = await contract.getCandidates()
      syncCandidates(refreshed)
    } catch (error) { setStatus(error.reason || error.shortMessage || 'The vote could not be completed.') }
    finally { setIsVoting(false) }
  }

  useEffect(() => {
    if (!window.ethereum) return undefined
    const handleAccounts = ([nextAccount]) => { setAccount(nextAccount || ''); setHasVoted(false) }
    window.ethereum.on('accountsChanged', handleAccounts)
    return () => window.ethereum.removeListener('accountsChanged', handleAccounts)
  }, [])

  return <div className="min-h-screen overflow-hidden bg-ink text-white">
    <div className="noise" />
    <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
      <div className="flex items-center gap-3"><div className="brand-mark">B</div><span className="font-display text-xl font-bold tracking-tight">BlockCast<span className="text-mint">.</span></span></div>
      <button className="wallet-button" onClick={connectWallet}>{account ? shortAddress(account) : 'Connect wallet'}<span className="status-dot" /></button>
    </header>

    <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 lg:px-10">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="grid items-end gap-12 pb-16 pt-16 lg:grid-cols-[1fr_330px] lg:pt-24">
        <div><p className="eyebrow">Community signal / 01</p><h1 className="hero-title">Your voice,<br /><em>verified.</em></h1><p className="mt-7 max-w-lg text-base leading-7 text-slate-400">A transparent, one-wallet-one-vote election for the people shaping the next chapter of our protocol.</p></div>
        <div className="stat-panel"><div className="flex items-center justify-between text-xs uppercase tracking-[.18em] text-slate-500"><span>Live tally</span><span className="live-label"><i /> Live</span></div><div className="mt-8 flex items-end justify-between"><strong>{totalVotes}</strong><span className="pb-1 text-right text-sm text-slate-400">total<br />votes cast</span></div><div className="mt-6 h-px bg-white/10" /><p className="mt-4 text-sm text-slate-400">Leading: <span className="text-white">{leadingCandidate?.name || 'Awaiting votes'}</span></p></div>
      </motion.section>

      <section className="border-t border-white/10 pt-8"><div className="mb-7 flex items-end justify-between"><div><p className="eyebrow">The candidates</p><h2 className="section-title">Choose your signal</h2></div><span className="hidden text-sm text-slate-500 sm:block">{candidates.length} voices on the ballot</span></div>
        <div className="grid gap-3 md:grid-cols-2">
          {candidates.map((candidate, index) => <motion.button key={candidate.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }} onClick={() => !hasVoted && setSelected(candidate.id)} className={`candidate-card ${selected === candidate.id ? 'selected' : ''} ${hasVoted ? 'cursor-default' : ''}`}><span className="candidate-number">0{index + 1}</span><span className="candidate-info"><strong>{candidate.name}</strong><small>{candidate.role}</small></span><span className="candidate-votes">{candidate.voteCount.toString()}<small>votes</small></span><span className="select-ring">{selected === candidate.id && <span />}</span></motion.button>)}
        </div>
      </section>
      <div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center"><p className="max-w-md text-sm leading-6 text-slate-500">Each connected wallet can cast one vote. Your choice is final once confirmed by the network.</p><button disabled={isVoting || hasVoted} onClick={castVote} className="vote-button">{isVoting ? 'Confirming...' : hasVoted ? 'Vote recorded' : 'Cast your vote'} <span>→</span></button></div>
      <AnimatePresence>{status && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-sm text-coral">{status}</motion.p>}{confirmed && <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="success-burst">✓</motion.div>}</AnimatePresence>
    </main>
    <footer className="relative z-10 mx-auto flex max-w-7xl justify-between px-6 pb-8 text-xs uppercase tracking-[.16em] text-slate-600 lg:px-10"><span>Built for the commons</span><span>BlockCast / 2026</span></footer>
  </div>
}