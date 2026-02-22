"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_NOTIFICATIONS } from "@/lib/graphql/notifications/queries";
import { SEND_BROADCAST_NOTIFICATION } from "@/lib/graphql/notifications/mutations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function NotificationsPage() {
    const [message, setMessage] = useState("");
    const [notificationType, setNotificationType] = useState("PUSH");
    const [isSending, setIsSending] = useState(false);

    const { data: activityData, refetch: refetchActivity } = useQuery(GET_MY_NOTIFICATIONS) as any;
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
            toast.success("Broadcast sent successfully!");
            setMessage("");
            refetchActivity();
        } catch (err) {
            toast.error("Failed to send broadcast");
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const recentActivity = activityData?.myNotifications || [];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Notifications <span className="text-primary">Center</span>
                </h1>
                <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
                    Manage organizational broadcasts and alerts
                </p>
            </div>

            <Tabs defaultValue="broadcast" className="w-full">
                <TabsList className="bg-muted/30 p-1 rounded-2xl border border-border/50 mb-8">
                    <TabsTrigger value="broadcast" className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        📢 Broadcast
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        📜 Recent Activity
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="broadcast">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl shadow-primary/5 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-foreground">Create New Broadcast</h3>
                                <p className="text-xs text-muted-foreground">Send a notification to everyone in your organization</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                                    <Textarea
                                        placeholder="Type your announcement here..."
                                        className="min-h-[150px] rounded-2xl border-border/50 focus:ring-primary/20 bg-muted/20"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Channel</label>
                                    <Select value={notificationType} onValueChange={setNotificationType}>
                                        <SelectTrigger className="rounded-xl border-border/50 bg-muted/20 h-12">
                                            <SelectValue placeholder="Select channel" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-border/50">
                                            <SelectItem value="PUSH">App Push Notification Only</SelectItem>
                                            <SelectItem value="EMAIL">Email Notification Only</SelectItem>
                                            <SelectItem value="BOTH">Both App Push & Email</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    onClick={handleBroadcast}
                                    disabled={isSending}
                                    className="w-full h-14 rounded-2xl bg-linear-to-r from-primary to-primary/80 text-white font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {isSending ? "Processing..." : "🚀 Send Broadcast Now"}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                <span className="text-4xl">💡</span>
                            </div>
                            <h3 className="text-xl font-black text-foreground">Future-Proof Tips</h3>
                            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                                Use RabbitMQ for high-reliability message delivery. Broadcasts are processed in the background to ensure no performance impact on the Admin Panel.
                            </p>
                            <div className="pt-4 flex gap-2">
                                <span className="bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-widest">
                                    RabbitMQ Ready
                                </span>
                                <span className="bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-widest">
                                    Celery Powered
                                </span>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="activity">
                    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="px-8 py-6 border-b border-border/50 bg-muted/20">
                            <h3 className="text-lg font-black text-foreground">System Audit Log</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Recent notifications sent through the system</p>
                        </div>

                        <div className="overflow-x-auto">
                            {recentActivity.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/10">
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/30">Notification</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/30">Type</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/30">Sent At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentActivity.map((notif: any) => (
                                            <tr key={notif.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-8 py-5 border-b border-border/30 group-last:border-0">
                                                    <p className="text-sm font-bold text-foreground mb-1">{notif.message}</p>
                                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{notif.verb}</p>
                                                </td>
                                                <td className="px-8 py-5 border-b border-border/30 group-last:border-0">
                                                    <span className="px-3 py-1 bg-muted rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                        {notif.targetType || "System"}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 border-b border-border/30 group-last:border-0">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-20">
                                        <span className="text-5xl">📭</span>
                                    </div>
                                    <p className="text-lg font-black text-muted-foreground">No recent activity detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
