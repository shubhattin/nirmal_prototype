'use client';

import React, { useContext, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '~/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  LogOut,
  ClipboardList,
  Bell,
  Camera,
  Upload,
  Check,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MapPin
} from 'lucide-react';
import { FaRecycle } from 'react-icons/fa';
import { RiDashboardFill } from 'react-icons/ri';
import { AppContext } from '~/components/AddDataContext';
import { signOut } from '~/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NotificationBell } from '~/components/NotificationBell';

const ACTION_STATUS_CONFIG = {
  in_progress: {
    label: 'In Progress',
    color: 'border-amber-700 bg-amber-900/30 text-amber-300',
    icon: Clock
  },
  under_review: {
    label: 'Under Review',
    color: 'border-purple-700 bg-purple-900/30 text-purple-300',
    icon: Eye
  },
  resolved: {
    label: 'Resolved',
    color: 'border-emerald-700 bg-emerald-900/30 text-emerald-400',
    icon: CheckCircle2
  },
  closed: {
    label: 'Closed',
    color: 'border-red-700 bg-red-900/30 text-red-300',
    icon: XCircle
  }
} as const;

function StatusBadge({ status }: { status: string }) {
  const config =
    ACTION_STATUS_CONFIG[status as keyof typeof ACTION_STATUS_CONFIG] ??
    ACTION_STATUS_CONFIG.in_progress;
  const Icon = config.icon;
  return (
    <motion.div
      key={status}
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

function ActionsTab() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);

  const actionsQuery = useQuery(trpc.worker.list_actions.queryOptions());
  const actions = actionsQuery.data ?? [];

  const selectedAction =
    selectedActionId != null ? (actions.find((a) => a.id === selectedActionId) ?? null) : null;
  const dialogOpen = Boolean(selectedAction);

  // Complaint image
  const complaintImageQuery = useQuery<string>({
    queryKey: [
      'complaint-image',
      selectedAction?.complaint?.id,
      selectedAction?.complaint?.image_s3_key
    ],
    queryFn: async () => {
      if (!selectedAction?.complaint?.id) throw new Error('No complaint');
      const res = await fetch('/api/complaint_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId: selectedAction.complaint.id })
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.url) throw new Error(payload?.message ?? 'Failed to load');
      return payload.url;
    },
    enabled: Boolean(dialogOpen && selectedAction?.complaint?.image_s3_key),
    staleTime: 1000 * 60 * 4
  });

  // Action evidence image
  const actionImageQuery = useQuery<string>({
    queryKey: ['action-image', selectedAction?.id, selectedAction?.s3_image_key],
    queryFn: async () => {
      if (!selectedAction?.id) throw new Error('No action');
      const res = await fetch('/api/action_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: selectedAction.id })
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.url) throw new Error(payload?.message ?? 'Failed to load');
      return payload.url;
    },
    enabled: Boolean(dialogOpen && selectedAction?.s3_image_key),
    staleTime: 1000 * 60 * 4
  });

  const handleUploadEvidence = async (file: File) => {
    if (!selectedAction || selectedAction.status !== 'in_progress') return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('actionId', String(selectedAction.id));
      formData.append('image', file);

      const res = await fetch('/api/worker_action_image', {
        method: 'POST',
        body: formData
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(payload?.message ?? 'Failed to upload evidence');
        return;
      }

      toast.success('Evidence uploaded! Your submission is now under review.');

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (filePickerRef.current) {
        filePickerRef.current.value = '';
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        predicate: (q) => {
          const key = q.queryKey;
          return (
            Array.isArray(key) && key.length > 0 && Array.isArray(key[0]) && key[0][0] === 'worker'
          );
        }
      });

      // Close dialog after successful upload
      setSelectedActionId(null);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (actionsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/30">
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-muted-foreground"
      >
        <ClipboardList className="mb-4 h-16 w-16 opacity-30" />
        <h3 className="mb-1 text-lg font-semibold">No tasks assigned</h3>
        <p className="text-sm">You don&apos;t have any tasks assigned yet. Check back later!</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {actions.map((action) => (
          <motion.div
            key={action.id}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <Card
              className="cursor-pointer border-border/30 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5"
              onClick={() => setSelectedActionId(action.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold">
                      {action.complaint?.title ?? 'Untitled Complaint'}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {action.complaint?.description || 'No description'}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground capitalize">
                        {action.complaint?.category}
                      </span>
                      {action.complaint?.latitude && action.complaint?.longitude && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {action.complaint.latitude.toFixed(3)},{' '}
                          {action.complaint.longitude.toFixed(3)}
                        </span>
                      )}
                    </div>
                    {action.admin_notes && (
                      <p className="mt-2 rounded bg-amber-900/20 px-2 py-1 text-xs text-amber-400">
                        💬 {action.admin_notes}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={action.status} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedActionId(null);
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAction?.complaint?.title ?? 'Task Details'}</DialogTitle>
            <DialogDescription>View complaint details and submit your evidence.</DialogDescription>
          </DialogHeader>
          {selectedAction && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Status</p>
                  <StatusBadge status={selectedAction.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Category</p>
                  <p className="text-sm capitalize">{selectedAction.complaint?.category}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase">Description</p>
                  <p className="rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
                    {selectedAction.complaint?.description?.trim() || 'No description provided.'}
                  </p>
                </div>
              </div>

              {selectedAction.admin_notes && (
                <div className="rounded-md border border-amber-800/30 bg-amber-950/20 p-3">
                  <p className="mb-1 text-xs font-semibold text-amber-300">Admin Instructions</p>
                  <p className="text-sm text-amber-200/80">{selectedAction.admin_notes}</p>
                </div>
              )}

              {/* Complaint Image */}
              {selectedAction.complaint?.image_s3_key && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Complaint Evidence</p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    {complaintImageQuery.isLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : complaintImageQuery.data ? (
                      <img
                        src={complaintImageQuery.data}
                        alt="Complaint evidence"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Unable to load image
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* My Submission */}
              {selectedAction.s3_image_key && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-cyan-300">Your Submission</p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-cyan-800/30 bg-muted">
                    {actionImageQuery.isLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : actionImageQuery.data ? (
                      <img
                        src={actionImageQuery.data}
                        alt="Your evidence"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Unable to load image
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Upload section */}
              {selectedAction.status === 'in_progress' && (
                <div className="space-y-3 rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                    <Camera className="h-4 w-4" /> Submit Evidence
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Take a photo or upload an image showing the completed work.
                  </p>
                  {/* Camera capture input - for mobile devices */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadEvidence(file);
                    }}
                  />
                  {/* File picker input - for all devices */}
                  <input
                    ref={filePickerRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadEvidence(file);
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {/* Camera button - show on mobile/touch devices */}
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-600/90 md:hidden"
                    >
                      {uploading ? (
                        <>
                          <Camera className="mr-2 h-4 w-4 animate-pulse" /> Capturing...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" /> Take Photo
                        </>
                      )}
                    </Button>
                    {/* File upload button - show on all devices */}
                    <Button
                      onClick={() => filePickerRef.current?.click()}
                      disabled={uploading}
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-600/90"
                    >
                      {uploading ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-pulse" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> Upload File
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {selectedAction.status === 'under_review' && (
                <div className="rounded-md border border-purple-800/30 bg-purple-950/20 p-3 text-center">
                  <Eye className="mx-auto mb-2 h-8 w-8 text-purple-400 opacity-60" />
                  <p className="text-sm font-medium text-purple-300">Under Admin Review</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your submission is being reviewed by an admin. You'll be notified of the result.
                  </p>
                </div>
              )}

              {selectedAction.status === 'resolved' && (
                <div className="rounded-md border border-emerald-800/30 bg-emerald-950/20 p-3 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400 opacity-60" />
                  <p className="text-sm font-medium text-emerald-300">Task Completed</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Great job! Your work has been approved.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function NotificationsTab() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery(trpc.worker.list_notifications.queryOptions());
  const markReadMut = useMutation(
    trpc.worker.mark_notification_read.mutationOptions({
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

export default function WorkerDash() {
  const { user_info } = useContext(AppContext);
  const router = useRouter();
  const trpc = useTRPC();
  const [activeTab, setActiveTab] = useState<'actions' | 'notifications'>('actions');

  const unreadCountQuery = useQuery(trpc.worker.unread_count.queryOptions());
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  const userName = user_info?.name || 'Worker';
  const userEmail = user_info?.email || '';
  const userImage = user_info?.image;
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleLogout() {
    await signOut();
    router.push('/');
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border/60 bg-linear-to-br from-cyan-900/40 via-cyan-900/10 to-transparent">
          <div className="flex items-center gap-3 px-2 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Link
              href="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/30 to-cyan-600/20 shadow-lg ring-1 ring-cyan-500/30 transition-all hover:from-cyan-500/40 hover:to-cyan-600/30 hover:ring-cyan-500/50"
            >
              <FaRecycle className="h-6 w-6 text-cyan-400" />
            </Link>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-bold tracking-wide text-cyan-300 uppercase">
                Nirmal Setu
              </span>
              <span className="truncate text-xs font-medium text-sidebar-foreground/60">
                Worker Console
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-hidden px-2 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="mb-2 px-2 text-xs font-bold tracking-wider text-sidebar-foreground/50 uppercase">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    isActive={activeTab === 'actions'}
                    tooltip="My Tasks"
                    onClick={() => setActiveTab('actions')}
                    className={`justify-start gap-3 rounded-lg px-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 ${activeTab === 'actions' ? 'bg-linear-to-r from-cyan-500/20 to-cyan-600/10 text-cyan-100 shadow-md ring-1 ring-cyan-500/30 hover:from-cyan-500/25 hover:to-cyan-600/15' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'}`}
                  >
                    <ClipboardList className="h-5 w-5 shrink-0 text-cyan-400" />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      My Tasks
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    isActive={activeTab === 'notifications'}
                    tooltip="Notifications"
                    onClick={() => setActiveTab('notifications')}
                    className={`justify-start gap-3 rounded-lg px-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 ${activeTab === 'notifications' ? 'bg-linear-to-r from-cyan-500/20 to-cyan-600/10 text-cyan-100 shadow-md ring-1 ring-cyan-500/30 hover:from-cyan-500/25 hover:to-cyan-600/15' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'}`}
                  >
                    <div className="relative">
                      <Bell className="h-5 w-5 shrink-0 text-cyan-400" />
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </div>
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      Notifications
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator className="mx-0" />
        <SidebarFooter className="border-t border-sidebar-border/60 bg-linear-to-br from-sidebar/80 to-transparent">
          <div className="flex items-center gap-3 px-2 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-cyan-500 to-blue-500 opacity-30 blur-sm" />
              <Avatar className="relative h-9 w-9 bg-linear-to-br from-cyan-600 to-blue-600 ring-1 ring-cyan-500/30">
                <AvatarFallback className="bg-transparent text-xs font-bold text-white">
                  {userInitials}
                </AvatarFallback>
                {userImage && <AvatarImage src={userImage} />}
              </Avatar>
            </div>
            <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">
                {userName}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/60">{userEmail}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 shrink-0 text-sidebar-foreground/60 transition-colors group-data-[collapsible=icon]:hidden hover:bg-red-500/20 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-col">
              <h1 className="text-lg leading-tight font-semibold">
                {activeTab === 'actions' ? 'My Tasks' : 'Notifications'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeTab === 'actions'
                  ? 'View and manage your assigned tasks.'
                  : 'Stay updated on task assignments and reviews.'}
              </p>
            </div>
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 p-2 md:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'actions' ? (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ActionsTab />
              </motion.div>
            ) : (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationsTab />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
