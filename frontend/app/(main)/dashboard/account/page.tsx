"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Clock, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { AccountDetails } from "@/lib/api-types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import { ProfilePicture } from '@/components/ProfilePicture'

export default function AccountPage() {
  const { user } = useAuth();
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  if (!user) {
    redirect("/auth/login");
  }

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      const response = await api.get<AccountDetails>("/api/customer/account");
      setAccountDetails(response);
    } catch (error) {
      console.error("Failed to fetch account details:", error);
      toast.error("Failed to fetch account details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!accountDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="h-32 flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-2">
              <AlertCircle className="w-8 h-8 text-[var(--warning)]" />
              <p>Failed to load account details</p>
              <Button variant="outline" size="sm" onClick={fetchAccountDetails}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-6 h-6 text-[var(--primary)]" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <ProfilePicture user={{
                  id: accountDetails.user.id,
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
                <div>
                  <h4 className="text-xl font-semibold text-[var(--text-primary)]">
                    {accountDetails.user.firstName}{" "}
                    {accountDetails.user.lastName}
                  </h4>
                  <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-2">
                    {accountDetails.user.email}
                    {accountDetails.user.isEmailVerified && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                <Clock className="w-4 h-4" />
                Last login:{" "}
                {new Date(
                  accountDetails.accountStatus.lastLogin
                ).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    accountDetails.accountStatus.status === "active"
                      ? "bg-[var(--success)]/10 text-[var(--success)]"
                      : "bg-[var(--warning)]/10 text-[var(--warning)]"
                  }`}
                >
                  {accountDetails.accountStatus.status === "active" ? (
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-1" />
                  )}
                  {accountDetails.accountStatus.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-[var(--primary)]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountDetails.recentInteractions.length === 0 ? (
              <div className="text-center text-[var(--text-tertiary)] py-8">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {accountDetails.recentInteractions.map((interaction, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">
                        {interaction.type}
                      </p>
                      <p className="text-[var(--text-tertiary)]">
                        {interaction.description}
                      </p>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(interaction.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
