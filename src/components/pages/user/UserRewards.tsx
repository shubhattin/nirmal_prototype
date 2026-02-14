'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Award,
  Shield,
  ShieldCheck,
  Star,
  Sparkles,
  CheckCircle2,
  Lock,
  HeadphonesIcon,
  Send,
  Trophy,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Tier definitions ────────────────────────────────────────────────
const TIERS = [
  {
    name: 'Bronze',
    threshold: 200,
    icon: Shield,
    color: 'from-amber-700 to-amber-500',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/20',
    bgColor: 'bg-amber-500/10',
    ringColor: 'ring-amber-500/30',
    emoji: '🥉',
    perks: ['Prioritized complaint handling', 'Faster response times on your reports']
  },
  {
    name: 'Silver',
    threshold: 500,
    icon: ShieldCheck,
    color: 'from-slate-400 to-slate-200',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-400/40',
    glowColor: 'shadow-slate-400/20',
    bgColor: 'bg-slate-400/10',
    ringColor: 'ring-slate-400/30',
    emoji: '🥈',
    perks: [
      'Top-priority complaint handling',
      'Direct contact support channel',
      'Dedicated support form access'
    ]
  }
] as const;

function getTier(points: number) {
  if (points >= 500) return { current: TIERS[1], index: 1 };
  if (points >= 200) return { current: TIERS[0], index: 0 };
  return { current: null, index: -1 };
}

function getNextTier(points: number) {
  if (points < 200) return TIERS[0];
  if (points < 500) return TIERS[1];
  return null;
}

function getProgress(points: number) {
  if (points >= 500) return 100;
  if (points >= 200) return ((points - 200) / 300) * 100;
  return (points / 200) * 100;
}

// ─── Animation variants ──────────────────────────────────────────────
const containerVars = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const itemVars = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 }
  }
};

const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 0px rgba(245,158,11,0)',
      '0 0 20px rgba(245,158,11,0.3)',
      '0 0 0px rgba(245,158,11,0)'
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }
  }
};

// ─── Main Component ──────────────────────────────────────────────────
export default function UserRewards({
  rewardPoints,
  isLoading
}: {
  rewardPoints: number;
  isLoading: boolean;
}) {
  const { current: currentTier, index: tierIndex } = getTier(rewardPoints);
  const nextTier = getNextTier(rewardPoints);
  const progress = getProgress(rewardPoints);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-8" variants={containerVars} initial="hidden" animate="visible">
      {/* ── Points & Current Tier Hero ── */}
      <motion.div variants={itemVars}>
        <Card className="relative overflow-hidden border-0 bg-linear-to-br from-emerald-950/80 via-emerald-900/40 to-slate-900/60 shadow-2xl">
          {/* Decorative floating shapes */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </div>

          <CardContent className="relative z-10 flex flex-col items-center gap-6 py-10">
            {/* Points counter */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Trophy className="h-8 w-8 text-amber-400" />
                </motion.div>
                <motion.span
                  className="text-5xl font-extrabold tracking-tight text-white"
                  key={rewardPoints}
                  initial={{ scale: 1.3, color: '#fbbf24' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.6 }}
                >
                  {rewardPoints}
                </motion.span>
              </div>
              <span className="text-sm font-medium tracking-widest text-emerald-300/80 uppercase">
                Reward Points
              </span>
            </motion.div>

            {/* Current tier badge */}
            <AnimatePresence mode="wait">
              {currentTier ? (
                <motion.div
                  key={currentTier.name}
                  initial={{ scale: 0, rotateY: 90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  exit={{ scale: 0, rotateY: -90 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-5 py-2.5',
                    'bg-linear-to-r shadow-lg',
                    currentTier.color,
                    currentTier.glowColor
                  )}
                >
                  <currentTier.icon className="h-5 w-5 text-white" />
                  <span className="text-sm font-bold text-white">
                    {currentTier.emoji} {currentTier.name} Tier
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="no-tier"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 ring-1 ring-white/10"
                >
                  <Star className="h-4 w-4 text-white/50" />
                  <span className="text-sm font-medium text-white/60">
                    Keep going! {200 - rewardPoints} pts to Bronze
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Progress Bar ── */}
      <motion.div variants={itemVars}>
        <Card className="border-white/5 bg-white/2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-amber-400" />
              {nextTier
                ? `Progress to ${nextTier.emoji} ${nextTier.name}`
                : '🎉 Maximum Tier Reached!'}
            </CardTitle>
            {nextTier && (
              <CardDescription>
                {nextTier.threshold - rewardPoints} more points needed
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Track */}
              <div className="relative h-5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                {/* Fill */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-emerald-500 via-emerald-400 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
                {/* Shimmer on fill */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-transparent via-white/20 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
              </div>

              {/* Milestone markers */}
              <div className="relative mt-2 flex justify-between px-0.5">
                <span className="text-xs text-white/40">0</span>
                <div
                  className="absolute flex flex-col items-center"
                  style={{
                    left: rewardPoints >= 500 ? '40%' : '100%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div
                    className={cn(
                      'h-2.5 w-2.5 rounded-full ring-2',
                      rewardPoints >= 200
                        ? 'bg-amber-400 ring-amber-400/30'
                        : 'bg-white/20 ring-white/10'
                    )}
                  />
                  <span
                    className={cn(
                      'mt-1 text-xs font-medium',
                      rewardPoints >= 200 ? 'text-amber-400' : 'text-white/40'
                    )}
                  >
                    200 · Bronze
                  </span>
                </div>
                {rewardPoints < 500 ? (
                  <div className="flex flex-col items-end">
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full ring-2',
                        rewardPoints >= 500
                          ? 'bg-slate-300 ring-slate-300/30'
                          : 'bg-white/20 ring-white/10'
                      )}
                    />
                    <span className="mt-1 text-xs text-white/40">500 · Silver</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-slate-300">500 · Silver ✓</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Tier Cards ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {TIERS.map((tier, i) => {
          const unlocked = tierIndex >= i;
          const isCurrent = tierIndex === i;
          const TierIcon = tier.icon;

          return (
            <motion.div key={tier.name} variants={itemVars}>
              <motion.div
                whileHover={unlocked ? { y: -6, transition: { duration: 0.2 } } : undefined}
                {...(isCurrent ? pulseGlow : {})}
                className="h-full"
              >
                <Card
                  className={cn(
                    'relative h-full overflow-hidden transition-all duration-300',
                    unlocked
                      ? `border ${tier.borderColor} ${tier.bgColor} shadow-lg ${tier.glowColor}`
                      : 'border-white/5 bg-white/2 opacity-60'
                  )}
                >
                  {/* Locked overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.3 + i * 0.1 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <Lock className="h-8 w-8 text-white/40" />
                        <span className="text-sm font-medium text-white/50">
                          {tier.threshold - rewardPoints} pts to unlock
                        </span>
                      </motion.div>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-xl',
                            unlocked ? `bg-linear-to-br ${tier.color} shadow-md` : 'bg-white/10'
                          )}
                          animate={isCurrent ? { scale: [1, 1.08, 1] } : undefined}
                          transition={
                            isCurrent
                              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                              : undefined
                          }
                        >
                          <TierIcon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                          <CardTitle className="text-lg">
                            {tier.emoji} {tier.name}
                          </CardTitle>
                          <CardDescription>{tier.threshold} points required</CardDescription>
                        </div>
                      </div>
                      {unlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <CheckCircle2 className={cn('h-6 w-6', tier.textColor)} />
                        </motion.div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-xs font-semibold tracking-wider text-white/40 uppercase">
                      Perks
                    </p>
                    <ul className="space-y-2.5">
                      {tier.perks.map((perk, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + j * 0.1 }}
                          className="flex items-start gap-2.5"
                        >
                          <Sparkles
                            className={cn(
                              'mt-0.5 h-4 w-4 shrink-0',
                              unlocked ? tier.textColor : 'text-white/30'
                            )}
                          />
                          <span
                            className={cn('text-sm', unlocked ? 'text-white/80' : 'text-white/40')}
                          >
                            {perk}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Contact Support Form (Silver tier) ── */}
      {tierIndex >= 1 && <ContactSupportForm />}
    </motion.div>
  );
}

// ─── Contact Support Form ────────────────────────────────────────────
function ContactSupportForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitted(true);
  }

  function handleReset() {
    setSubject('');
    setMessage('');
    setSubmitted(false);
  }

  return (
    <motion.div variants={itemVars}>
      <Card className="relative overflow-hidden border-slate-400/20 bg-linear-to-br from-slate-900/60 via-slate-800/30 to-transparent shadow-xl">
        {/* Decorative accent */}
        <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-linear-to-bl from-slate-400/10 to-transparent" />

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-slate-400 to-slate-300 shadow-md">
              <HeadphonesIcon className="h-5 w-5 text-slate-900" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Direct Contact Support
                <span className="rounded-full bg-slate-400/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                  Silver Perk
                </span>
              </CardTitle>
              <CardDescription>
                As a Silver tier member, you have access to our priority support channel.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="border-white/10 bg-white/5 placeholder:text-white/25 focus:border-slate-400/40 focus:ring-slate-400/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail. Our priority support team will review this promptly."
                    rows={4}
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-slate-400/40 focus:ring-1 focus:ring-slate-400/20 focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!subject.trim() || !message.trim()}
                  className="w-full gap-2 bg-linear-to-r from-slate-500 to-slate-400 font-semibold text-white shadow-lg transition-all hover:from-slate-400 hover:to-slate-300 hover:shadow-slate-400/25 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  Submit Support Request
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-5 py-8"
              >
                {/* Success icon with particles */}
                <div className="relative">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-2 w-2 rounded-full bg-emerald-400"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos((i * Math.PI * 2) / 6) * 50,
                        y: Math.sin((i * Math.PI * 2) / 6) * 50,
                        opacity: 0,
                        scale: 0
                      }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: -4,
                        marginTop: -4
                      }}
                    />
                  ))}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 15, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30"
                  >
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <h3 className="text-xl font-bold text-white">Request Submitted!</h3>
                  <p className="mt-2 max-w-sm text-sm text-white/60">
                    Thank you for reaching out. Our priority support team will review your request
                    and get back to you as soon as possible. Silver tier members receive responses
                    within 24 hours.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="gap-2 border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Submit Another Request
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
