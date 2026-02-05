'use client';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  FunnelChart,
  Funnel
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, ClipboardList, Timer, LogOut } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { MapPin, MoreHorizontal, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { inferRouterOutputs } from '@trpc/server';
import { useTRPC } from '~/api/client';
import { toast } from 'sonner';
import React, { useContext, useState } from 'react';
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
import { FaRecycle } from 'react-icons/fa';
import { RiDashboardFill } from 'react-icons/ri';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppContext } from '~/components/AddDataContext';
import { signOut } from '~/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AppRouter } from '~/api/trpc_router';

const trendData = [
  { month: 'Jan', raised: 120, resolved: 80, pending: 40, avgResolutionTime: 32 },
  { month: 'Feb', raised: 140, resolved: 110, pending: 30, avgResolutionTime: 28 },
  { month: 'Mar', raised: 160, resolved: 150, pending: 10, avgResolutionTime: 24 },
  { month: 'Apr', raised: 180, resolved: 160, pending: 20, avgResolutionTime: 22 },
  { month: 'May', raised: 220, resolved: 210, pending: 10, avgResolutionTime: 26 },
  { month: 'Jun', raised: 200, resolved: 195, pending: 5, avgResolutionTime: 20 }
];

const categoryData = [
  { category: 'Biodegradable', count: 260, severity: 2.1, resolved: 240, color: '#10B981' },
  { category: 'Non-biodegradable', count: 180, severity: 3.2, resolved: 165, color: '#F59E0B' },
  { category: 'Hazardous', count: 75, severity: 4.8, resolved: 68, color: '#EF4444' },
  { category: 'E-waste', count: 40, severity: 3.9, resolved: 35, color: '#8B5CF6' }
];

const resolutionFunnelData = [
  { name: 'Reported', value: 1240, fill: '#0EA5E9' },
  { name: 'Verified', value: 1180, fill: '#06B6D4' },
  { name: 'Assigned', value: 1120, fill: '#10B981' },
  { name: 'In Progress', value: 920, fill: '#F59E0B' },
  { name: 'Resolved', value: 920, fill: '#059669' }
];

const localityPerformance = [
  {
    locality: 'Ward 12',
    openComplaints: 62,
    avgResolutionTime: 28,
    citizenSatisfaction: 3.2,
    population: 15000
  },
  {
    locality: 'Ward 4',
    openComplaints: 54,
    avgResolutionTime: 24,
    citizenSatisfaction: 3.8,
    population: 12000
  },
  {
    locality: 'Ward 19',
    openComplaints: 41,
    avgResolutionTime: 22,
    citizenSatisfaction: 4.1,
    population: 18000
  },
  {
    locality: 'Ward 7',
    openComplaints: 33,
    avgResolutionTime: 20,
    citizenSatisfaction: 4.5,
    population: 14000
  },
  {
    locality: 'Ward 15',
    openComplaints: 28,
    avgResolutionTime: 18,
    citizenSatisfaction: 4.2,
    population: 16000
  },
  {
    locality: 'Ward 8',
    openComplaints: 25,
    avgResolutionTime: 16,
    citizenSatisfaction: 4.6,
    population: 13000
  }
];

const timeSeriesData = [
  { time: '00:00', complaints: 2, staff: 1 },
  { time: '04:00', complaints: 1, staff: 1 },
  { time: '08:00', complaints: 15, staff: 8 },
  { time: '12:00', complaints: 25, staff: 12 },
  { time: '16:00', complaints: 20, staff: 10 },
  { time: '20:00', complaints: 8, staff: 4 }
];

const priorityDistribution = [
  { priority: 'Critical', count: 45, avgResolution: 4, color: '#DC2626' },
  { priority: 'High', count: 125, avgResolution: 12, color: '#F59E0B' },
  { priority: 'Medium', count: 280, avgResolution: 24, color: '#10B981' },
  { priority: 'Low', count: 150, avgResolution: 48, color: '#6B7280' }
];

const resolutionRate = 90; // percent

type ComplaintsList = inferRouterOutputs<AppRouter>['complaints']['list_complaints'];
type ComplaintItem = ComplaintsList[number];

function AdminMain() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<string | null>(null);
  const [reviewComplaintId, setReviewComplaintId] = useState<string | null>(null);
  const [closeDialogComplaintId, setCloseDialogComplaintId] = useState<string | null>(null);

  const complaints_q = useQuery(trpc.complaints.list_complaints.queryOptions());

  const complaintsData: ComplaintsList = complaints_q.data ?? [];
  const reviewComplaint: ComplaintItem | null =
    reviewComplaintId != null
      ? (complaintsData.find((complaint) => complaint.id === reviewComplaintId) ?? null)
      : null;
  const closeDialogComplaint: ComplaintItem | null =
    closeDialogComplaintId != null
      ? (complaintsData.find((complaint) => complaint.id === closeDialogComplaintId) ?? null)
      : null;
  const reviewDialogOpen = Boolean(reviewComplaintId && reviewComplaint);

  const reviewImageQuery = useQuery<string>({
    queryKey: ['complaint-image', reviewComplaint?.id, reviewComplaint?.image_s3_key],
    queryFn: async ({ queryKey }) => {
      const [, complaintId] = queryKey as [string, string | undefined, string | undefined];
      if (!complaintId) {
        throw new Error('Missing complaint id');
      }
      const response = await fetch('/api/complaint_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ complaintId })
      });
      const payload = (await response.json().catch(() => null)) as {
        url?: string;
        message?: string;
      } | null;
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.message ?? 'Failed to load complaint image');
      }
      return payload.url;
    },
    enabled: Boolean(reviewDialogOpen && reviewComplaint?.image_s3_key),
    staleTime: 1000 * 60 * 4
  });

  const update_status_mut = useMutation(
    trpc.complaints.update_status.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              key.length > 0 &&
              Array.isArray(key[0]) &&
              key[0][0] === 'complaints' &&
              key[0][1] === 'list_complaints'
            );
          }
        });
        toast.success('Status updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update status');
      }
    })
  );

  const delete_complaint_mut = useMutation(
    trpc.complaints.delete_complaint.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              key.length > 0 &&
              Array.isArray(key[0]) &&
              key[0][0] === 'complaints' &&
              key[0][1] === 'list_complaints'
            );
          }
        });
        toast.success('Complaint deleted successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete complaint');
      }
    })
  );

  const handleStatusUpdate = (
    id: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ) => {
    update_status_mut.mutate({ id, status });
  };

  const handleDeleteClick = (id: string) => {
    setComplaintToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (complaintToDelete) {
      delete_complaint_mut.mutate(
        { id: complaintToDelete },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setComplaintToDelete(null);
          },
          onError: () => {
            setDeleteDialogOpen(false);
            setComplaintToDelete(null);
          }
        }
      );
    }
  };

  const handleCloseConfirm = () => {
    if (!closeDialogComplaintId) return;
    const targetId = closeDialogComplaintId;
    update_status_mut.mutate(
      { id: targetId, status: 'closed' },
      {
        onSuccess: () => {
          setCloseDialogComplaintId(null);
          if (reviewComplaintId === targetId) {
            setReviewComplaintId(null);
          }
        }
      }
    );
  };

  const formatStatus = (status: ComplaintItem['status']) => {
    if (status === 'resolved') return 'Resolved';
    if (status === 'in_progress') return 'In Progress';
    if (status === 'closed') return 'Closed';
    return 'Open';
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatLocation = (lat: number, lng: number) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ClipboardList className="size-5 text-primary" />}
          label="Total Complaints"
          value="1,240"
        />
        <StatCard
          icon={<AlertCircle className="size-5 text-amber-600" />}
          label="Open"
          value="320"
        />
        <StatCard
          icon={<CheckCircle2 className="size-5 text-emerald-600" />}
          label="Resolved"
          value="920"
        />
        <StatCard
          icon={<Timer className="size-5 text-blue-600" />}
          label="Avg Resolution Time"
          value="26h"
        />
      </div>

      {/* Complaints Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
          <CardDescription>Manage and track complaint resolution status</CardDescription>
        </CardHeader>
        <CardContent>
          {complaints_q.isLoading || complaints_q.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <Table className="rounded-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaintsData.length > 0 ? (
                  complaintsData.map((complaint) => {
                    return (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-medium">
                          {complaint.id.substring(0, 5)}
                        </TableCell>
                        <TableCell>
                          {complaint.user?.name || complaint.user?.displayUsername || 'N/A'}
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground" />
                          {formatLocation(complaint.latitude, complaint.longitude)}
                        </TableCell>
                        <TableCell className="capitalize">{complaint.category}</TableCell>
                        <TableCell className="max-w-xs truncate">{complaint.title}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
                              complaint.status === 'resolved'
                                ? 'border-emerald-700 bg-emerald-900/30 text-emerald-400'
                                : complaint.status === 'in_progress'
                                  ? 'border-cyan-700 bg-cyan-900/30 text-cyan-400'
                                  : 'border-amber-700 bg-amber-900/30 text-amber-400'
                            }`}
                          >
                            {formatStatus(complaint.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {complaint.created_at ? formatDate(complaint.created_at) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled={update_status_mut.isPending}
                                  aria-label="Complaint actions"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                {(complaint.status === 'open' ||
                                  complaint.status === 'in_progress') && (
                                  <>
                                    <DropdownMenuLabel>Workflow</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setReviewComplaintId(complaint.id)}
                                    >
                                      <ClipboardList className="mr-2 size-4" />
                                      Review
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setCloseDialogComplaintId(complaint.id)}
                                      className="text-amber-600 focus:text-amber-600"
                                      disabled={update_status_mut.isPending}
                                    >
                                      <XCircle className="mr-2 size-4" />
                                      Close
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {(complaint.status === 'resolved' ||
                                  complaint.status === 'closed') && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => setReviewComplaintId(complaint.id)}
                                    >
                                      <ClipboardList className="mr-2 size-4" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(complaint.id)}
                                  disabled={delete_complaint_mut.isPending}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No complaints found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Complaints Trend & Performance</CardTitle>
            <CardDescription>Monthly statistics with resolution time analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                raised: { label: 'Raised', color: 'hsl(188 94% 43%)' },
                resolved: { label: 'Resolved', color: 'hsl(152.4 76.2% 40%)' },
                pending: { label: 'Pending', color: 'hsl(48 96% 53%)' },
                avgResolutionTime: { label: 'Avg Time (hrs)', color: 'hsl(0 84% 60%)' }
              }}
              className="h-80"
            >
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="count" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  yAxisId="time"
                  orientation="right"
                  domain={[15, 35]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <ChartTooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="mb-2 font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm">
                            <span style={{ color: entry.color }}>{entry.dataKey}: </span>
                            {entry.value}
                            {entry.dataKey === 'avgResolutionTime' ? 'h' : ''}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  yAxisId="count"
                  dataKey="raised"
                  stackId="1"
                  stroke="var(--color-raised)"
                  fill="var(--color-raised)"
                  fillOpacity={0.6}
                />
                <Area
                  yAxisId="count"
                  dataKey="resolved"
                  stackId="2"
                  stroke="var(--color-resolved)"
                  fill="var(--color-resolved)"
                  fillOpacity={0.8}
                />
                <Bar
                  yAxisId="count"
                  dataKey="pending"
                  fill="var(--color-pending)"
                  radius={[4, 4, 0, 0]}
                  opacity={0.7}
                />
                <Line
                  yAxisId="time"
                  type="monotone"
                  dataKey="avgResolutionTime"
                  stroke="var(--color-avgResolutionTime)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-avgResolutionTime)', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resolution Workflow</CardTitle>
            <CardDescription>Process efficiency funnel</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: 'Count', color: 'hsl(158 64% 52%)' }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Funnel dataKey="value" data={resolutionFunnelData} isAnimationActive />
                  <ChartTooltip
                    content={({ payload, label }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      const previousValue =
                        resolutionFunnelData[resolutionFunnelData.indexOf(data) - 1]?.value ||
                        data.value;
                      const conversion = ((data.value / previousValue) * 100).toFixed(1);

                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm">Count: {data.value}</p>
                          {previousValue !== data.value && (
                            <p className="text-sm text-muted-foreground">
                              Conversion: {conversion}%
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                </FunnelChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Analysis</CardTitle>
            <CardDescription>Complaints by type with severity and resolution rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: 'Total', color: 'hsl(217 91% 60%)' },
                resolved: { label: 'Resolved', color: 'hsl(152.4 76.2% 40%)' },
                severity: { label: 'Avg Severity', color: 'hsl(0 84% 60%)' }
              }}
              className="h-72"
            >
              <ComposedChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis yAxisId="count" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  yAxisId="severity"
                  orientation="right"
                  domain={[0, 5]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <ChartTooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    const resolutionRate = ((data.resolved / data.count) * 100).toFixed(1);

                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="mb-2 font-medium">{label}</p>
                        <p className="text-sm">Total: {data.count}</p>
                        <p className="text-sm">
                          Resolved: {data.resolved} ({resolutionRate}%)
                        </p>
                        <p className="text-sm">Avg Severity: {data.severity}/5</p>
                      </div>
                    );
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  yAxisId="count"
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  opacity={0.6}
                />
                <Bar
                  yAxisId="count"
                  dataKey="resolved"
                  fill="var(--color-resolved)"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Line
                  yAxisId="severity"
                  type="monotone"
                  dataKey="severity"
                  stroke="var(--color-severity)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-severity)', strokeWidth: 2, r: 5 }}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Complaints by priority with resolution times</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: 'Count', color: 'hsl(217 91% 60%)' },
                avgResolution: { label: 'Avg Resolution (hrs)', color: 'hsl(47 96% 53%)' }
              }}
              className="h-72"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={priorityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="priority" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="count" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    yAxisId="time"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <ChartTooltip
                    content={({ payload, label }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;

                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <p className="mb-2 font-medium">{label} Priority</p>
                          <p className="text-sm">Count: {data.count}</p>
                          <p className="text-sm">Avg Resolution: {data.avgResolution}h</p>
                        </div>
                      );
                    }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  {priorityDistribution.map((entry, index) => (
                    <Bar
                      key={index}
                      yAxisId="count"
                      dataKey="count"
                      fill={entry.color}
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                  ))}
                  <Line
                    yAxisId="time"
                    type="monotone"
                    dataKey="avgResolution"
                    stroke="var(--color-avgResolution)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-avgResolution)', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Activity Pattern</CardTitle>
            <CardDescription>Complaints and staff utilization by time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                complaints: { label: 'Complaints', color: 'hsl(0 84% 60%)' },
                staff: { label: 'Active Staff', color: 'hsl(152.4 76.2% 40%)' }
              }}
              className="h-80"
            >
              <ComposedChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="complaints" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  yAxisId="staff"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <ChartTooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="mb-2 font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm">
                            <span style={{ color: entry.color }}>{entry.dataKey}: </span>
                            {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  yAxisId="complaints"
                  dataKey="complaints"
                  stroke="var(--color-complaints)"
                  fill="var(--color-complaints)"
                  fillOpacity={0.3}
                />
                <Line
                  yAxisId="staff"
                  type="monotone"
                  dataKey="staff"
                  stroke="var(--color-staff)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-staff)', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Rate</CardTitle>
            <CardDescription>Closed within SLA</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ rate: { label: 'Resolution', color: 'hsl(152.4 76.2% 40%)' } }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  data={[{ name: 'rate', value: resolutionRate, bg: 100 }]}
                  innerRadius={60}
                  outerRadius={120}
                  startAngle={90}
                  endAngle={-270}
                >
                  <defs>
                    <linearGradient id="rateGradient2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <RadialBar
                    dataKey="bg"
                    fill="hsl(var(--muted))"
                    cornerRadius={8}
                    background
                    isAnimationActive={false}
                  />
                  <RadialBar dataKey="value" cornerRadius={8} fill="url(#rateGradient2)" />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-2xl font-bold"
                  >
                    {resolutionRate}%
                  </text>
                  <text
                    x="50%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-sm"
                  >
                    Resolution Rate
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Performance Leaderboard</CardTitle>
            <CardDescription>Localities ranked by combined metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {localityPerformance
                .sort((a, b) => {
                  const scoreA =
                    5 -
                    (a.avgResolutionTime - 15) / 3 +
                    a.citizenSatisfaction -
                    a.openComplaints / 20;
                  const scoreB =
                    5 -
                    (b.avgResolutionTime - 15) / 3 +
                    b.citizenSatisfaction -
                    b.openComplaints / 20;
                  return scoreB - scoreA;
                })
                .slice(0, 6)
                .map((locality, index) => {
                  const score =
                    5 -
                    (locality.avgResolutionTime - 15) / 3 +
                    locality.citizenSatisfaction -
                    locality.openComplaints / 20;
                  const rank = index + 1;
                  const medalColor =
                    rank === 1
                      ? 'text-yellow-500'
                      : rank === 2
                        ? 'text-gray-400'
                        : rank === 3
                          ? 'text-amber-600'
                          : 'text-muted-foreground';
                  const performance =
                    locality.avgResolutionTime < 22 && locality.citizenSatisfaction > 4
                      ? 'Excellent'
                      : locality.avgResolutionTime < 25 && locality.citizenSatisfaction > 3.5
                        ? 'Good'
                        : 'Needs Focus';
                  const performanceColor =
                    performance === 'Excellent'
                      ? 'text-green-600 bg-green-50 border-green-200'
                      : performance === 'Good'
                        ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                        : 'text-red-600 bg-red-50 border-red-200';

                  return (
                    <div key={locality.locality} className="space-y-2 rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${medalColor}`}>#{rank}</span>
                          <span className="font-medium">{locality.locality}</span>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${performanceColor}`}
                        >
                          {performance}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>📋 {locality.openComplaints} open</div>
                        <div>⏱️ {locality.avgResolutionTime}h avg</div>
                        <div>😊 {locality.citizenSatisfaction}/5 rating</div>
                        <div>👥 {(locality.population / 1000).toFixed(0)}k people</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-linear-to-r from-green-500 to-emerald-600"
                          style={{ width: `${Math.min(100, (score / 8) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={reviewDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setReviewComplaintId(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {reviewComplaint?.status === 'resolved' || reviewComplaint?.status === 'closed'
                ? 'View Complaint'
                : 'Review Complaint'}
            </DialogTitle>
            <DialogDescription>
              {reviewComplaint?.status === 'resolved' || reviewComplaint?.status === 'closed'
                ? 'View complaint details and evidence.'
                : 'Validate the report and update its status.'}
            </DialogDescription>
          </DialogHeader>
          {reviewComplaint ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Title</p>
                  <p className="text-sm font-semibold">{reviewComplaint.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
                      reviewComplaint.status === 'resolved'
                        ? 'border-emerald-700 bg-emerald-900/30 text-emerald-400'
                        : reviewComplaint.status === 'in_progress'
                          ? 'border-cyan-700 bg-cyan-900/30 text-cyan-300'
                          : reviewComplaint.status === 'closed'
                            ? 'border-red-700 bg-red-900/30 text-red-300'
                            : 'border-amber-700 bg-amber-900/30 text-amber-300'
                    }`}
                  >
                    {formatStatus(reviewComplaint.status)}
                  </span>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase">Description</p>
                  <p className="rounded-md border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
                    {reviewComplaint.description?.trim()
                      ? reviewComplaint.description
                      : 'No description provided.'}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Category</p>
                  <p className="text-sm capitalize">{reviewComplaint.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Location</p>
                  <p className="font-mono text-sm">
                    {formatLocation(reviewComplaint.latitude, reviewComplaint.longitude)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Reported on</p>
                  <p className="text-sm">
                    {reviewComplaint.created_at ? formatDate(reviewComplaint.created_at) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Evidence</p>
                {reviewComplaint.image_s3_key ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    {reviewImageQuery.isLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : reviewImageQuery.isError ? (
                      <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        {reviewImageQuery.error instanceof Error
                          ? reviewImageQuery.error.message
                          : 'Unable to load image.'}
                      </div>
                    ) : (
                      <img
                        src={reviewImageQuery.data}
                        alt="Complaint evidence"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Image not attached.</p>
                )}
              </div>
              <DialogFooter className="flex flex-wrap gap-3">
                {reviewComplaint.status !== 'resolved' && reviewComplaint.status !== 'closed' && (
                  <>
                    {reviewComplaint.status === 'open' && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(reviewComplaint.id, 'in_progress')}
                        disabled={update_status_mut.isPending}
                      >
                        Move to In Progress
                      </Button>
                    )}
                    <Button
                      onClick={() => handleStatusUpdate(reviewComplaint.id, 'resolved')}
                      disabled={update_status_mut.isPending}
                      className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                    >
                      Mark as Resolved
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setCloseDialogComplaintId(reviewComplaint.id)}
                      disabled={update_status_mut.isPending}
                    >
                      Close as Unresolved
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a complaint to review its details.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(closeDialogComplaintId)}
        onOpenChange={(open) => {
          if (!open) {
            setCloseDialogComplaintId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close complaint?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing marks the complaint as unresolved. You can reopen it later if additional
              action is needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            {closeDialogComplaint?.title || 'No complaint selected.'}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={update_status_mut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseConfirm}
              disabled={update_status_mut.isPending}
              className="bg-amber-600 text-white hover:bg-amber-600/90 focus-visible:ring-amber-500"
            >
              Close Complaint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setComplaintToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the complaint from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={delete_complaint_mut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={delete_complaint_mut.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {delete_complaint_mut.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminDashPage() {
  const { user_info } = useContext(AppContext);
  const router = useRouter();

  const userName = user_info?.name || 'Admin';
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
        <SidebarHeader className="border-b border-sidebar-border/60 bg-linear-to-br from-emerald-900/40 via-emerald-900/10 to-transparent">
          <div className="flex items-center gap-3 px-2 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Link
              href="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500/30 to-emerald-600/20 shadow-lg ring-1 ring-emerald-500/30 transition-all hover:from-emerald-500/40 hover:to-emerald-600/30 hover:ring-emerald-500/50"
            >
              <FaRecycle className="h-6 w-6 text-emerald-400" />
            </Link>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-bold tracking-wide text-emerald-300 uppercase">
                Nirmal Setu
              </span>
              <span className="truncate text-xs font-medium text-sidebar-foreground/60">
                Admin Console
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
                    isActive
                    tooltip="Admin Dashboard"
                    className="justify-start gap-3 rounded-lg bg-linear-to-r from-emerald-500/20 to-emerald-600/10 px-3 text-emerald-100 shadow-md ring-1 ring-emerald-500/30 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 hover:from-emerald-500/25 hover:to-emerald-600/15"
                  >
                    <RiDashboardFill className="h-5 w-5 shrink-0 text-emerald-400" />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      Dashboard
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
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-500 to-cyan-500 opacity-30 blur-sm" />
              <Avatar className="relative h-9 w-9 bg-linear-to-br from-emerald-600 to-cyan-600 ring-1 ring-emerald-500/30">
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
        <header className="flex h-16 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-col">
            <h1 className="text-lg leading-tight font-semibold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Monitor and manage complaints, performance, and operations.
            </p>
          </div>
        </header>
        <main className="flex-1 p-2 md:p-6">
          <AdminMain />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          {icon}
        </div>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
