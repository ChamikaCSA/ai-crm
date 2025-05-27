"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Clock, CheckCircle2, AlertCircle, Activity, Ticket, Bell, Settings, Shield, MessageSquare, Mail, LogIn, FileText, Zap, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { AccountDetails, InteractionType } from "@/lib/api-types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import { ProfilePicture } from '@/components/profile-picture'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { containerVariants, itemVariants } from '@/lib/animations'

const getInteractionIcon = (type: InteractionType) => {
  switch (type) {
    case InteractionType.CHAT:
      return MessageSquare;
    case InteractionType.EMAIL:
      return Mail;
    case InteractionType.SUPPORT_TICKET:
      return Ticket;
    case InteractionType.SYSTEM:
      return Settings;
    case InteractionType.LOGIN:
      return LogIn;
    case InteractionType.SETTINGS_UPDATE:
      return Settings;
    case InteractionType.PROFILE_UPDATE:
      return User;
    case InteractionType.DOCUMENT_VIEW:
      return FileText;
    case InteractionType.FEATURE_USAGE:
      return Zap;
    default:
      return Activity;
  }
};

export default function AccountPage() {
  const { user } = useAuth();
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const INITIAL_ACTIVITIES_COUNT = 3;

  if (!user) {
    redirect("/auth/login");
  }

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      const response = await api.get<AccountDetails>("/api/users/account");
      setAccountDetails(response);

    } catch (error) {
      console.error("Failed to fetch account details:", error);
      toast.error("Failed to fetch account details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="flex items-start gap-6 p-4 rounded-lg bg-[var(--card)]/50">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[var(--card)]/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24 mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[var(--card)]/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24 mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accountDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="h-32 flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-2">
              <AlertCircle className="w-8 h-8 text-[var(--warning)]" />
              <p>Failed to load account details</p>
              <Button variant="outline" size="sm" onClick={fetchAccountDetails} className="group">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="w-6 h-6 text-[var(--primary)]" />
                Account Information
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">Manage your account details and preferences</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm" className="gap-2 hover:bg-[var(--primary)]/10 transition-colors">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="flex items-start gap-6 p-4 rounded-lg bg-[var(--card)]/50 hover:bg-[var(--card)]/80 transition-colors">
                  <ProfilePicture user={{
                    _id: accountDetails.user._id,
                    email: accountDetails.user.email,
                    firstName: accountDetails.user.firstName,
                    lastName: accountDetails.user.lastName,
                    role: accountDetails.user.role,
                    isMfaEnabled: accountDetails.user.isMfaEnabled,
                    isEmailVerified: accountDetails.user.isEmailVerified,
                    isActive: accountDetails.user.isActive,
                    createdAt: new Date(accountDetails.user.createdAt),
                    updatedAt: new Date(accountDetails.user.updatedAt)
                  }} size="lg" />
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      {accountDetails.user.firstName} {accountDetails.user.lastName}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant={accountDetails.accountStatus.status === "active" ? "success" : "warning"} className="text-xs">
                              {accountDetails.accountStatus.status}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Account Status</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h4>
                    <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-2">
                      {accountDetails.user.email}
                      {accountDetails.user.isEmailVerified && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Email verified</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Joined {new Date(accountDetails.user.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bell className="w-4 h-4" />
                        Last login {new Date(accountDetails.accountStatus.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[var(--card)]/50 hover:bg-[var(--card)]/80 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <h4 className="font-medium">Two-Factor Auth</h4>
                          <p className="text-sm text-[var(--text-tertiary)]">
                            {accountDetails.user.isMfaEnabled ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[var(--card)]/50 hover:bg-[var(--card)]/80 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <h4 className="font-medium">Email Verification</h4>
                          <p className="text-sm text-[var(--text-tertiary)]">
                            {accountDetails.user.isEmailVerified ? "Verified" : "Not Verified"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-[var(--primary)]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountDetails.recentInteractions.length === 0 ? (
              <div className="text-center text-[var(--text-tertiary)] py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {accountDetails.recentInteractions
                    .slice(0, INITIAL_ACTIVITIES_COUNT)
                    .map((interaction, index) => {
                    const Icon = getInteractionIcon(interaction.type);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors bg-[var(--card)]/50 hover:bg-[var(--card)]/80 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                                {interaction.type}
                              </h3>
                              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                                {interaction.description}
                              </p>
                            </div>
                          </div>
                          <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                            {new Date(interaction.timestamp).toLocaleDateString()}
                          </time>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
