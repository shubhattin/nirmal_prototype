'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '~/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, User, Wrench, Crown } from 'lucide-react';

const ROLE_CONFIG = {
  user: { label: 'User', color: 'bg-slate-500/20 text-slate-300 border-slate-600', icon: User },
  worker: {
    label: 'Worker',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-600',
    icon: Wrench
  },
  admin: {
    label: 'Admin',
    color: 'bg-amber-500/20 text-amber-300 border-amber-600',
    icon: Shield
  },
  super_admin: {
    label: 'Super Admin',
    color: 'bg-purple-500/20 text-purple-300 border-purple-600',
    icon: Crown
  }
} as const;

type RoleKey = keyof typeof ROLE_CONFIG;

function RoleBadge({ role }: { role: string | null }) {
  const key = (role ?? 'user') as RoleKey;
  const config = ROLE_CONFIG[key] ?? ROLE_CONFIG.user;
  const Icon = config.icon;
  return (
    <motion.div
      key={key}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Badge variant="outline" className={`gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    </motion.div>
  );
}

export default function UserManagement() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        setDebouncedQuery(value);
      }, 300);
      setDebounceTimer(timer);
    },
    [debounceTimer]
  );

  const usersQuery = useQuery(
    trpc.super_admin.search_users.queryOptions({ query: debouncedQuery })
  );

  const changeRoleMut = useMutation(
    trpc.super_admin.change_user_role.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              key.length > 0 &&
              Array.isArray(key[0]) &&
              key[0][0] === 'super_admin' &&
              key[0][1] === 'search_users'
            );
          }
        });
        toast.success('Role updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update role');
      }
    })
  );

  const users = usersQuery.data ?? [];

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="border-emerald-900/30 bg-linear-to-br from-emerald-950/20 to-transparent shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-purple-400" />
            User Management
          </CardTitle>
          <CardDescription>
            Search users and manage their roles across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border-border/50 bg-background/50 pl-10 transition-colors focus:border-emerald-500/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {usersQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/30">
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-9 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
        >
          <User className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">
            {debouncedQuery
              ? `No users found for "${debouncedQuery}"`
              : 'No users found in the system'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-3 md:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          <AnimatePresence mode="popLayout">
            {users.map((u) => {
              const initials = (u.name || '')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              return (
                <motion.div
                  key={u.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <Card className="border-border/30 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-500 to-cyan-500 opacity-20 blur-sm" />
                        <Avatar className="relative h-12 w-12 ring-1 ring-border/50">
                          <AvatarFallback className="bg-linear-to-br from-emerald-600/30 to-cyan-600/30 text-sm font-bold">
                            {initials}
                          </AvatarFallback>
                          {u.image && <AvatarImage src={u.image} />}
                        </Avatar>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        <div className="mt-1">
                          <RoleBadge role={u.role} />
                        </div>
                      </div>
                      <Select
                        value={u.role ?? 'user'}
                        onValueChange={(val) =>
                          changeRoleMut.mutate({
                            userId: u.id,
                            role: val as Exclude<RoleKey, 'super_admin'>
                          })
                        }
                        disabled={changeRoleMut.isPending}
                      >
                        <SelectTrigger className="h-9 w-32 border-border/50 bg-background/50 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <span className="flex items-center gap-1.5">
                              <User className="h-3 w-3" /> User
                            </span>
                          </SelectItem>
                          <SelectItem value="worker">
                            <span className="flex items-center gap-1.5">
                              <Wrench className="h-3 w-3" /> Worker
                            </span>
                          </SelectItem>
                          <SelectItem value="admin">
                            <span className="flex items-center gap-1.5">
                              <Shield className="h-3 w-3" /> Admin
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
