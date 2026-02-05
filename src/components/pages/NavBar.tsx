'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles, Menu, X, Zap, User, Settings } from 'lucide-react';
import { FaRecycle } from 'react-icons/fa';
import React from 'react';
import { AppContext } from '~/components/AddDataContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from '~/lib/auth-client';

export default function NavBar({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const { user_info } = React.useContext(AppContext);
  const pathname = usePathname();
  const isUserDashboard = pathname === '/user_dashboard';
  const isAdminDashboard = pathname === '/admin_dashboard';
  const isAbout = pathname === '/about';
  const isHome = pathname === '/';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-xl',
        className
      )}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-4 transition-all duration-300 hover:scale-105"
        >
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 12 }}
            whileHover={{
              rotate: [0, -5, 5, 0],
              scale: 1.1
            }}
            className="relative"
          >
            {/* Glowing background */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-green-500 opacity-30 blur-lg transition-opacity duration-300 group-hover:opacity-50" />
            <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 via-teal-600 to-green-600 shadow-xl">
              <FaRecycle className="size-7 text-white" />
            </div>
          </motion.div>

          <div className="flex flex-col leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-500 to-green-400 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              Nirmal Setu
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Sparkles className="size-3" /> AI-Powered Waste Management
            </span>
          </div>
        </Link>

        {user_info && (
          <nav className="hidden items-center gap-8 md:flex">
            {user_info.role === 'user' && !isUserDashboard && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/user_dashboard"
                  className="group flex items-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-gray-300 transition-all duration-300 hover:border-cyan-500/30 hover:bg-gradient-to-r hover:from-cyan-600/20 hover:to-green-600/20 hover:text-white"
                >
                  <User className="size-5 transition-colors group-hover:text-cyan-400" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </motion.div>
            )}
            {user_info.role === 'admin' && !isAdminDashboard && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/admin_dashboard"
                  className="group flex items-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-gray-300 transition-all duration-300 hover:border-green-500/30 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-emerald-600/20 hover:text-white"
                >
                  <Settings className="size-5 transition-colors group-hover:text-green-400" />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              </motion.div>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isHome && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/about"
                className="group hidden items-center gap-2.5 rounded-xl border border-transparent px-4 py-2.5 text-gray-300 transition-all duration-300 hover:border-cyan-500/30 hover:bg-gradient-to-r hover:from-cyan-600/20 hover:to-green-600/20 hover:text-white md:flex"
              >
                <Zap className="size-5 transition-colors group-hover:text-cyan-400" />
                <span className="font-medium">About</span>
              </Link>
            </motion.div>
          )}

          {!user_info ? (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block"
              >
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-gray-700 bg-transparent text-gray-300 transition-all duration-300 hover:border-gray-600 hover:bg-gray-800/50 hover:text-white"
                >
                  <Link href="/login">Login</Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block"
              >
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-cyan-600 to-green-600 font-medium text-white shadow-lg transition-all duration-300 hover:from-cyan-700 hover:to-green-700 hover:shadow-blue-500/25"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </motion.div>
            </>
          ) : (
            (isUserDashboard || isAdminDashboard) && <UserPopover />
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 transition-all duration-300 hover:bg-gray-800/50 hover:text-white md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="border-t border-gray-800/50 bg-black/90 backdrop-blur-xl md:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-2 px-6 py-4">
            {isHome && (
              <MobileLink href="/about" onClick={() => setOpen(false)}>
                <Zap className="size-5 text-cyan-400" />
                <span>About</span>
              </MobileLink>
            )}

            {user_info?.role === 'user' && !isUserDashboard && (
              <MobileLink href="/user_dashboard" onClick={() => setOpen(false)}>
                <User className="size-5 text-blue-400" />
                <span>User Dashboard</span>
              </MobileLink>
            )}
            {user_info?.role === 'admin' && !isAdminDashboard && (
              <MobileLink href="/admin_dashboard" onClick={() => setOpen(false)}>
                <Settings className="size-5 text-green-400" />
                <span>Admin Dashboard</span>
              </MobileLink>
            )}

            <div className="flex items-center gap-3 pt-4">
              {!user_info ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-green-600 text-white hover:from-cyan-700 hover:to-green-700"
                  >
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50 hover:text-white"
                >
                  <Link href="/">Logout</Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}

function MobileLink({
  href,
  children,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white"
    >
      {children}
    </Link>
  );
}

function UserPopover() {
  const { user_info } = React.useContext(AppContext);

  const name = user_info!.name;
  const username = user_info!.username;
  const email = user_info!.email;
  const image = user_info!.image;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const router = useRouter();

  async function onLogout() {
    await signOut();
    router.push('/login');
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm shadow-lg transition-all duration-300 hover:border-gray-600 hover:bg-gray-700/50"
        > */}
        <div className="relative">
          {/* Glowing avatar background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 opacity-30 blur" />
          <Avatar className="relative size-8 bg-gradient-to-br from-cyan-600 to-green-600">
            <AvatarFallback className="bg-transparent text-sm font-bold text-white">
              {initials || 'U'}
            </AvatarFallback>
            {image && <AvatarImage src={image} />}
          </Avatar>
        </div>
        {/* <span className="hidden max-w-[12rem] truncate font-medium text-gray-200 sm:inline-block">
            {name}
          </span> */}
        {/* </motion.button> */}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 border-gray-800 bg-gray-900/95 p-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 opacity-40 blur" />
              <Avatar className="relative size-12 bg-gradient-to-br from-cyan-600 to-green-600">
                <AvatarFallback className="bg-transparent font-bold text-white">
                  {initials || 'U'}
                </AvatarFallback>
                {image && <AvatarImage src={image} />}
              </Avatar>
            </div>
            <div className="min-w-0 space-y-1">
              <div className="truncate text-lg font-bold text-white">{name}</div>
              {username && <div className="truncate text-sm text-blue-400">@{username}</div>}
              <div className="truncate text-sm text-gray-500">{email}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 p-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full justify-center border-gray-700 bg-transparent text-gray-300 transition-all duration-300 hover:border-red-500/50 hover:bg-red-600/20 hover:text-red-400"
            >
              Logout
            </Button>
          </motion.div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
