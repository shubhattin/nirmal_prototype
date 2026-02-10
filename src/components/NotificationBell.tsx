'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '~/api/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function NotificationBell() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const unreadQuery = useQuery(trpc.worker.unread_count.queryOptions());
  const unreadCount = unreadQuery.data?.count ?? 0;

  const notificationsQuery = useQuery(
    trpc.worker.list_notifications.queryOptions(undefined, { enabled: open })
  );

  const markAllReadMut = useMutation(
    trpc.worker.mark_all_read.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey;
            return (
              Array.isArray(key) &&
              key.length > 0 &&
              Array.isArray(key[0]) &&
              key[0][0] === 'worker'
            );
          }
        });
      }
    })
  );

  const notifications = notificationsQuery.data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-white">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 border-gray-800 bg-gray-900/95 p-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <h4 className="text-sm font-semibold text-white">Notifications</h4>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
              onClick={() => markAllReadMut.mutate()}
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="mb-2 size-8 text-gray-700" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <div
                key={n.id}
                className={`border-b border-gray-800/50 px-4 py-3 transition-colors hover:bg-gray-800/30 ${
                  !n.read ? 'border-l-2 border-l-cyan-500 bg-cyan-950/10' : 'opacity-60'
                }`}
              >
                <p className="text-sm font-medium text-gray-200">{n.title}</p>
                {n.description && (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {n.description}
                  </p>
                )}
                <p className="mt-2 text-[10px] font-medium text-gray-600">
                  {new Date(n.created_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t border-gray-800 p-2">
            <button className="w-full py-1 text-center text-xs text-gray-500 transition-colors hover:text-white">
              View all notifications
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
