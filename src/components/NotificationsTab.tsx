'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '~/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function NotificationsTab() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery(trpc.worker.list_notifications.queryOptions());

  const invalidateNotifications = async () => {
    await queryClient.invalidateQueries({
      predicate: (q) => {
        const key = q.queryKey;
        return (
          Array.isArray(key) && key.length > 0 && Array.isArray(key[0]) && key[0][0] === 'worker'
        );
      }
    });
  };

  const markReadMut = useMutation(
    trpc.worker.mark_notification_read.mutationOptions({
      onSuccess: invalidateNotifications
    })
  );

  const markAllReadMut = useMutation(
    trpc.worker.mark_all_read.mutationOptions({
      onSuccess: async () => {
        await invalidateNotifications();
        toast.success('All notifications marked as read');
      }
    })
  );

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notificationsQuery.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-muted-foreground"
      >
        <Bell className="mb-4 h-16 w-16 opacity-30" />
        <h3 className="mb-1 text-lg font-semibold">No notifications</h3>
        <p className="text-sm">You&apos;re all caught up!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllReadMut.mutate()}
            disabled={markAllReadMut.isPending}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" /> Mark all read
          </Button>
        </div>
      )}
      <motion.div
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
      >
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 }
            }}
          >
            <Card
              className={`border-border/30 transition-all duration-200 ${!notif.read ? 'border-l-2 border-l-cyan-500 bg-cyan-950/5' : 'opacity-70'}`}
              onClick={() => {
                if (!notif.read) markReadMut.mutate({ id: notif.id });
              }}
            >
              <CardContent className="cursor-pointer p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{notif.title}</p>
                    {notif.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {notif.description}
                      </p>
                    )}
                  </div>
                  {!notif.read && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-500" />
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(notif.created_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
