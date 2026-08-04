"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_NOTIFICATIONS } from "@/lib/graphql/notifications/queries";
import { SEND_BROADCAST_NOTIFICATION } from "@/lib/graphql/notifications/mutations";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { FormTextarea } from "@/components/common/FormTextArea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Bell, Megaphone } from "lucide-react";

export default function NotificationsPage() {
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState("PUSH");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"broadcast" | "activity">("broadcast");

  const { data: activityData, refetch: refetchActivity } = useQuery(
    GET_MY_NOTIFICATIONS,
    { variables: { level: "admin" } }
  ) as any;
  const [sendBroadcast] = useMutation(SEND_BROADCAST_NOTIFICATION);

  const handleBroadcast = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      await sendBroadcast({
        variables: {
          message,
          verb: "announcement",
          notificationType,
        },
      });
      toast.success("Broadcast sent");
      setMessage("");
      refetchActivity();
    } catch (err) {
      toast.error("Failed to send broadcast");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const recentActivity = activityData?.myNotifications?.results || [];

  return (
    <div className="page-shell">
      <PageHeader
        title="Notifications"
        description="Send organization-wide announcements and review recent activity."
      />

      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {[
          { id: "broadcast" as const, label: "Broadcast", icon: Megaphone },
          { id: "activity" as const, label: "Recent activity", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">New broadcast</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Send a notification to everyone in your organization.
            </p>

            <div className="mt-5 space-y-4">
              <FormTextarea
                label="Message"
                placeholder="Write your announcement…"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Channel</label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUSH">Push only</SelectItem>
                    <SelectItem value="EMAIL">Email only</SelectItem>
                    <SelectItem value="BOTH">Push and email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleBroadcast}
                disabled={isSending}
                className="w-full sm:w-auto"
              >
                {isSending ? "Sending…" : "Send broadcast"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-5">
            <h3 className="text-sm font-semibold text-foreground">Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Keep announcements short and actionable.</li>
              <li>Use email for formal or policy updates.</li>
              <li>Broadcasts are queued so the admin app stays responsive.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
            <p className="text-xs text-muted-foreground">
              Notifications sent through the system
            </p>
          </div>

          {recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Notification</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((notif: any) => (
                    <tr key={notif.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 align-top">
                        <p className="font-medium text-foreground">{notif.message}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{notif.verb}</p>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {notif.targetType || "System"}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-top text-muted-foreground">
                        <p>{new Date(notif.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
