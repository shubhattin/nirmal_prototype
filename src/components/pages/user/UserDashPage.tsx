'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { FaRecycle } from 'react-icons/fa';
import { RiDashboardFill, RiRobotFill } from 'react-icons/ri';
import { IoMegaphoneSharp, IoGameController } from 'react-icons/io5';
import { Truck } from 'lucide-react';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  LineChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, MapPin, Coins, Award } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import GameComp from '../game/GameComp';
import PickupMissed from '../pickup/PickupMissed';
import { Bot, User } from 'lucide-react';
import { Response } from '~/components/ai-elements/response';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTRPC } from '~/api/client';
import { useQuery } from '@tanstack/react-query';
import ComplaintPage from '@/components/pages/complaint/ComplaintPage';
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
import { AppContext } from '~/components/AddDataContext';
import { signOut } from '~/lib/auth-client';
import Link from 'next/link';
import { AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import React from 'react';
import { NotificationBell } from '~/components/NotificationBell';
import { NotificationsTab } from '~/components/NotificationsTab';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const myComplaints = [
  { month: 'Jan', open: 1, resolved: 2, total: 3, satisfaction: 4.2 },
  { month: 'Feb', open: 2, resolved: 1, total: 3, satisfaction: 3.8 },
  { month: 'Mar', open: 1, resolved: 3, total: 4, satisfaction: 4.5 },
  { month: 'Apr', open: 0, resolved: 2, total: 2, satisfaction: 4.8 },
  { month: 'May', open: 1, resolved: 2, total: 3, satisfaction: 4.1 },
  { month: 'Jun', open: 0, resolved: 1, total: 1, satisfaction: 4.9 }
];

const localityCleanliness = [
  { week: 'W1', score: 68, target: 75, improvement: 2.1 },
  { week: 'W2', score: 72, target: 75, improvement: 1.8 },
  { week: 'W3', score: 74, target: 75, improvement: 2.7 },
  { week: 'W4', score: 78, target: 75, improvement: 3.2 }
];

const complaintsByCategory = [
  { name: 'Biodegradable', value: 45, color: '#10B981' },
  { name: 'Non-Biodegradable', value: 30, color: '#F59E0B' },
  { name: 'E-Waste', value: 15, color: '#EF4444' },
  { name: 'Hazardous', value: 10, color: '#8B5CF6' }
];

const weeklyActivity = [
  { day: 'Mon', reports: 2, points: 40, engagement: 85 },
  { day: 'Tue', reports: 1, points: 20, engagement: 60 },
  { day: 'Wed', reports: 3, points: 60, engagement: 90 },
  { day: 'Thu', reports: 0, points: 10, engagement: 30 },
  { day: 'Fri', reports: 4, points: 80, engagement: 95 },
  { day: 'Sat', reports: 2, points: 45, engagement: 70 },
  { day: 'Sun', reports: 1, points: 25, engagement: 50 }
];

const environmentalImpact = [
  { metric: 'CO2 Saved', value: 85, max: 100, unit: 'kg' },
  { metric: 'Waste Diverted', value: 92, max: 100, unit: '%' },
  { metric: 'Community Health', value: 78, max: 100, unit: 'pts' },
  { metric: 'Recycling Rate', value: 88, max: 100, unit: '%' }
];

const monthlyGoal = 500;

type UserDashboardTab =
  | 'dashboard'
  | 'complaint'
  | 'game'
  | 'assistant'
  | 'pickup'
  | 'notifications';

export default function UserDashPage() {
  const trpc = useTRPC();
  const { user_info } = React.useContext(AppContext);

  const complaints_q = useQuery(trpc.complaints.list_complaints.queryOptions());
  const reward_points_q = useQuery(trpc.complaints.user_reward_points.queryOptions());
  const unreadCountQuery = useQuery(trpc.worker.unread_count.queryOptions());
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const userName = user_info?.name || 'User';
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

  const [activeTab, setActiveTab] = useState<UserDashboardTab>(() => {
    if (tabParam === 'complaint') return 'complaint';
    if (tabParam === 'game') return 'game';
    if (tabParam === 'assistant') return 'assistant';
    if (tabParam === 'pickup') return 'pickup';
    if (tabParam === 'notifications') return 'notifications';
    return 'dashboard';
  });

  const currentTitle =
    activeTab === 'dashboard'
      ? 'Dashboard'
      : activeTab === 'complaint'
        ? 'Raise a Complaint'
        : activeTab === 'game'
          ? 'Gamified Learning'
          : activeTab === 'assistant'
            ? 'ShuchiAI Assistant'
            : activeTab === 'pickup'
              ? 'Pickup Missed'
              : 'Notifications';
  const currentSubtitle =
    activeTab === 'dashboard'
      ? 'Overview of your activity, complaints, and locality insights.'
      : activeTab === 'complaint'
        ? 'Pin the location and submit a new cleanliness complaint.'
        : activeTab === 'game'
          ? 'Learn waste segregation through an interactive game.'
          : activeTab === 'assistant'
            ? 'Chat with ShuchiAI for help with complaints, insights, and rewards.'
            : activeTab === 'pickup'
              ? 'Report missed waste collection and contact authorities.'
              : 'Stay updated on your complaint status and community news.';

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
                Citizen Portal
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
                    isActive={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                    tooltip="Dashboard"
                    className={cn(
                      'justify-start gap-3 rounded-lg px-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                      activeTab === 'dashboard'
                        ? 'bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-100 shadow-md ring-1 ring-emerald-500/30 hover:from-emerald-500/25 hover:to-emerald-600/15'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <RiDashboardFill
                      className={cn(
                        'h-5 w-5 shrink-0',
                        activeTab === 'dashboard' ? 'text-emerald-400' : 'text-blue-400'
                      )}
                    />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      Dashboard
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    isActive={activeTab === 'complaint'}
                    onClick={() => setActiveTab('complaint')}
                    tooltip="Raise a Complaint"
                    className={cn(
                      'justify-start gap-3 rounded-lg px-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                      activeTab === 'complaint'
                        ? 'bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-100 shadow-md ring-1 ring-emerald-500/30 hover:from-emerald-500/25 hover:to-emerald-600/15'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <IoMegaphoneSharp
                      className={cn(
                        'h-5 w-5 shrink-0',
                        activeTab === 'complaint' ? 'text-emerald-400' : 'text-orange-400'
                      )}
                    />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      Raise a Complaint
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    isActive={activeTab === 'game'}
                    onClick={() => setActiveTab('game')}
                    tooltip="Gamified Learning"
                    className={cn(
                      'justify-start gap-3 rounded-lg px-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                      activeTab === 'game'
                        ? 'bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-100 shadow-md ring-1 ring-emerald-500/30 hover:from-emerald-500/25 hover:to-emerald-600/15'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <IoGameController
                      className={cn(
                        'h-5 w-5 shrink-0',
                        activeTab === 'game' ? 'text-emerald-400' : 'text-purple-400'
                      )}
                    />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      Gamified Learning
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    isActive={activeTab === 'assistant'}
                    onClick={() => setActiveTab('assistant')}
                    tooltip="ShuchiAI Assistant"
                    className={cn(
                      'justify-start gap-3 rounded-lg px-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                      activeTab === 'assistant'
                        ? 'bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-100 shadow-md ring-1 ring-emerald-500/30 hover:from-emerald-500/25 hover:to-emerald-600/15'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <RiRobotFill
                      className={cn(
                        'h-5 w-5 shrink-0',
                        activeTab === 'assistant' ? 'text-emerald-400' : 'text-cyan-400'
                      )}
                    />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      ShuchiAI Assistant
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    isActive={activeTab === 'pickup'}
                    onClick={() => setActiveTab('pickup')}
                    tooltip="Pickup Missed"
                    className={cn(
                      'justify-start gap-3 rounded-lg px-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                      activeTab === 'pickup'
                        ? 'bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-100 shadow-md ring-1 ring-emerald-500/30 hover:from-emerald-500/25 hover:to-emerald-600/15'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <Truck
                      className={cn(
                        'h-5 w-5 shrink-0',
                        activeTab === 'pickup' ? 'text-emerald-400' : 'text-red-400'
                      )}
                    />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      Pickup Missed
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    isActive={activeTab === 'notifications'}
                    onClick={() => setActiveTab('notifications')}
                    tooltip="Notifications"
                    className={cn(
                      'justify-start gap-3 rounded-lg px-3 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                      activeTab === 'notifications'
                        ? 'bg-linear-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-100 shadow-md ring-1 ring-emerald-500/30 hover:from-emerald-500/25 hover:to-emerald-600/15'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <div className="relative">
                      <Bell
                        className={cn(
                          'h-5 w-5 shrink-0',
                          activeTab === 'notifications' ? 'text-emerald-400' : 'text-blue-500'
                        )}
                      />
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
        <header className="flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-col">
              <h1 className="text-lg leading-tight font-semibold">{currentTitle}</h1>
              <p className="text-xs text-muted-foreground">{currentSubtitle}</p>
            </div>
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 px-4 py-6">
          {activeTab === 'dashboard' && (
            <DashboardTab complaints_q={complaints_q} reward_points_q={reward_points_q} />
          )}
          {activeTab === 'complaint' && <RaiseComplaintTab onTabChange={setActiveTab} />}
          {activeTab === 'game' && <GamifiedLearningTab />}
          {activeTab === 'assistant' && <ShuchiAITab />}
          {activeTab === 'pickup' && <PickupMissedTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

const containerVars = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20
    }
  }
};

function DashboardTab({
  complaints_q,
  reward_points_q
}: {
  complaints_q: any;
  reward_points_q: any;
}) {
  return (
    <motion.div className="space-y-6" variants={containerVars} initial="hidden" animate="visible">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BadgeCheck className="size-5 text-emerald-600" />}
          label="Resolved"
          value="10"
        />
        <StatCard icon={<MapPin className="size-5 text-blue-600" />} label="Open" value="2" />
        {reward_points_q.isLoading || (reward_points_q.isPending && !reward_points_q.isSuccess) ? (
          <motion.div variants={itemVars}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Reward Points</CardDescription>
                  <Coins className="size-5 text-amber-600" />
                </div>
                <Skeleton className="h-8 w-20" />
              </CardHeader>
            </Card>
          </motion.div>
        ) : (
          <StatCard
            icon={<Coins className="size-5 text-amber-600" />}
            label="Reward Points"
            value={String(reward_points_q.data?.reward_points ?? 0)}
          />
        )}
        <StatCard
          icon={<Award className="size-5 text-primary" />}
          label="Level"
          value="Citizen Helper"
        />
      </div>

      {/* My Complaints Table */}
      <motion.div variants={itemVars}>
        <Card className="border-t-4 border-t-emerald-500/20 shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle>My Complaints</CardTitle>
            <CardDescription>Track your submitted complaints and their status</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 sm:pt-4">
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
                  </div>
                ))}
              </div>
            ) : complaints_q.data && complaints_q.data.length > 0 ? (
              <div className="-mx-2 overflow-x-auto sm:mx-0">
                <Table className="min-w-[720px] rounded-lg text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">ID</TableHead>
                      <TableHead className="whitespace-nowrap">Location</TableHead>
                      <TableHead className="whitespace-nowrap">Category</TableHead>
                      <TableHead className="whitespace-nowrap">Title</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints_q.data.map((complaint: any) => {
                      const formatStatus = (status: string) => {
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

                      const formatLocation = (lat: number, lng: number) => {
                        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                      };

                      return (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-medium">
                            {complaint.id.substring(0, 8)}
                          </TableCell>
                          <TableCell className="flex items-center gap-1 whitespace-nowrap">
                            <MapPin className="size-3 text-muted-foreground" />
                            {formatLocation(complaint.latitude, complaint.longitude)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap capitalize">
                            {complaint.category}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{complaint.title}</TableCell>
                          <TableCell className="whitespace-nowrap">
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
                          <TableCell className="whitespace-nowrap">
                            {complaint.created_at ? formatDate(complaint.created_at) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 text-4xl">✨</div>
                <p className="text-lg font-medium text-foreground">No complaints, all good!</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your area is clean and complaint-free. Keep up the great work!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        <motion.div variants={itemVars} className="flex h-full flex-col lg:col-span-2">
          <Card className="flex h-full flex-col">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle>My Complaints & Satisfaction</CardTitle>
              <CardDescription>
                Tracking resolution progress and satisfaction ratings
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-2 sm:pt-4">
              <ChartContainer
                config={{
                  open: { label: 'Open', color: 'hsl(0 84% 60%)' },
                  resolved: { label: 'Resolved', color: 'hsl(152.4 76.2% 40%)' },
                  satisfaction: { label: 'Satisfaction', color: 'hsl(217 91% 60%)' }
                }}
                className="h-[260px]"
              >
                <ComposedChart data={myComplaints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="count" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    yAxisId="rating"
                    orientation="right"
                    domain={[0, 5]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    yAxisId="count"
                    dataKey="open"
                    fill="var(--color-open)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Bar
                    yAxisId="count"
                    dataKey="resolved"
                    fill="var(--color-resolved)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Line
                    yAxisId="rating"
                    type="monotone"
                    dataKey="satisfaction"
                    stroke="var(--color-satisfaction)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-satisfaction)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'var(--color-satisfaction)', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars} className="flex h-full flex-col">
          <Card className="flex h-full flex-col">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle>Complaint Categories</CardTitle>
              <CardDescription>Distribution by waste type</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-2 sm:pt-4">
              <ChartContainer
                config={{
                  biodegradable: { label: 'Biodegradable', color: '#10B981' },
                  nonBiodegradable: { label: 'Non-Biodegradable', color: '#F59E0B' },
                  eWaste: { label: 'E-Waste', color: '#EF4444' },
                  hazardous: { label: 'Hazardous', color: '#8B5CF6' }
                }}
                className="h-[260px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complaintsByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {complaintsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.value}% of complaints
                            </p>
                          </div>
                        );
                      }}
                    />
                    <ChartLegend
                      content={({ payload }) => (
                        <ul className="mt-4 grid grid-cols-2 gap-2 text-xs">
                          {payload?.map((entry, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.value}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Locality Cleanliness Progress</CardTitle>
              <CardDescription>Weekly scores with target comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  score: { label: 'Score', color: 'hsl(158 64% 52%)' },
                  target: { label: 'Target', color: 'hsl(215 25% 65%)' },
                  improvement: { label: 'Improvement', color: 'hsl(47 96% 53%)' }
                }}
                className="h-72"
              >
                <ComposedChart data={localityCleanliness}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    yAxisId="score"
                    domain={[60, 85]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="improvement"
                    orientation="right"
                    domain={[0, 4]}
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
                              {entry.dataKey === 'improvement'
                                ? '% increase'
                                : entry.dataKey === 'score'
                                  ? '/100'
                                  : ''}
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    yAxisId="score"
                    dataKey="score"
                    stroke="var(--color-score)"
                    fill="var(--color-score)"
                    fillOpacity={0.3}
                  />
                  <Line
                    yAxisId="score"
                    type="monotone"
                    dataKey="target"
                    stroke="var(--color-target)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Bar
                    yAxisId="improvement"
                    dataKey="improvement"
                    fill="var(--color-improvement)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.7}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity Overview</CardTitle>
              <CardDescription>Reports submitted and engagement levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  reports: { label: 'Reports', color: 'hsl(152.4 76.2% 40%)' },
                  points: { label: 'Points Earned', color: 'hsl(47 96% 53%)' },
                  engagement: { label: 'Engagement', color: 'hsl(217 91% 60%)' }
                }}
                className="h-72"
              >
                <ComposedChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="count" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    yAxisId="percentage"
                    orientation="right"
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    yAxisId="count"
                    dataKey="reports"
                    fill="var(--color-reports)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Bar
                    yAxisId="count"
                    dataKey="points"
                    fill="var(--color-points)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.6}
                  />
                  <Line
                    yAxisId="percentage"
                    type="monotone"
                    dataKey="engagement"
                    stroke="var(--color-engagement)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-engagement)', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function RaiseComplaintTab({ onTabChange }: { onTabChange: (tab: UserDashboardTab) => void }) {
  return (
    <div className="space-y-4">
      <ComplaintPage onTabChange={onTabChange} />
    </div>
  );
}

function GamifiedLearningTab() {
  const [playing, setPlaying] = useState(true);

  return (
    <div className="space-y-6">
      {!playing ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <h2 className="text-xl font-semibold">Gamified Learning</h2>
          <p className="max-w-xl text-center text-sm text-muted-foreground">
            Play the waste segregation game to learn how to dispose of different types of waste in a
            fun, interactive way.
          </p>
          <Button
            onClick={() => setPlaying(true)}
            className="group relative overflow-hidden rounded-full border-2 border-amber-400/50 bg-linear-to-r from-amber-600 to-orange-600 px-6 py-4 text-base font-bold text-white shadow-2xl shadow-amber-900/50 transition-all duration-300 hover:scale-105 hover:border-amber-400/70 hover:shadow-amber-400/60 focus:ring-4 focus:ring-amber-300"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <span>Start Waste Segregation Game</span>
            </span>
            <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-yellow-400 via-amber-400 to-orange-400 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-20" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setPlaying(false)}>
              Exit Game
            </Button>
          </div> */}
          <div className="space-y-6">
            <GameComp onExit={() => setPlaying(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function ShuchiAITab() {
  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-xl border bg-background">
      <ChatBot />
    </div>
  );
}

function PickupMissedTab() {
  return (
    <div className="space-y-4">
      <PickupMissed />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div variants={itemVars} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
      <Card className="overflow-hidden transition-all hover:border-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>{label}</CardDescription>
            {icon}
          </div>
          <CardTitle className="text-2xl">{value}</CardTitle>
        </CardHeader>
      </Card>
    </motion.div>
  );
}

const ChatBot = () => {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' })
  });
  const [input, setInput] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const initialAssistantMd = `### Hi, I’m ShuchiAI 👋\n\nI can help you with:\n\n- Raising or tracking complaints\n- Understanding cleanliness insights\n- Earning and redeeming reward points\n\nAsk me anything to get started!`;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (status === 'ready') {
      const inputEl = formRef.current?.querySelector<HTMLInputElement>('input[data-slot="input"]');
      inputEl?.focus();
    }
  }, [status]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-emerald-600" />
          <span className="font-semibold">ShuchiAI</span>
        </div>
        {/* <span
          className={cn(
            'text-xs',
            status === 'streaming' ? 'text-amber-600' : 'text-muted-foreground'
          )}
        >
          {status === 'streaming' ? 'Thinking…' : 'Ready'}
        </span> */}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
        {messages.length === 0 && (
          <div className="flex w-full items-start justify-start gap-3">
            <Avatar className="size-8">
              <AvatarFallback>
                <Bot className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="max-w-[80%] rounded-2xl border bg-background px-4 py-2 text-sm text-foreground shadow-sm">
              <Response className="prose prose-sm dark:prose-invert prose-pre:rounded-md prose-code:before:content-[''] prose-code:after:content-[''] max-w-none">
                {initialAssistantMd}
              </Response>
            </div>
          </div>
        )}
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const text = m.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
          return (
            <div
              key={m.id}
              className={cn(
                'flex w-full items-start gap-3',
                isUser ? 'justify-end' : 'justify-start'
              )}
            >
              {!isUser && (
                <Avatar className="size-8">
                  <AvatarFallback>
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm',
                  isUser
                    ? 'bg-linear-to-r from-emerald-600 to-lime-600 text-white'
                    : 'border bg-background text-foreground'
                )}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap">{text}</div>
                ) : (
                  <Response className="prose prose-sm dark:prose-invert prose-pre:rounded-md prose-code:before:content-[''] prose-code:after:content-[''] max-w-none">
                    {text}
                  </Response>
                )}
              </div>
              {isUser && (
                <Avatar className="size-8">
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = input.trim();
          if (!trimmed || status !== 'ready') return;
          sendMessage({ text: trimmed });
          setInput('');
        }}
        className="border-t p-3"
      >
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'ready'}
            placeholder="Ask anything about cleanliness, complaints, rewards…"
            className="flex-1"
          />
          <Button type="submit" disabled={status !== 'ready' || !input.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
