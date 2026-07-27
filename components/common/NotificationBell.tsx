"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_NOTIFICATIONS, GET_UNREAD_COUNT } from "@/lib/graphql/notifications/queries";
import { MARK_NOTIFICATION_READ, MARK_ALL_READ, DELETE_NOTIFICATION } from "@/lib/graphql/notifications/mutations";
import {
  Bell,
  Mail,
  MailOpen,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/lib/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const router = useRouter();
  const { data: notificationsData, refetch: refetchNotifications } = useQuery(
    GET_MY_NOTIFICATIONS,
    { variables: { level: "admin" } }
  ) as any;
  const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_COUNT, {
    variables: { level: "admin" },
  }) as any;

  useNotifications(() => {
    refetchNotifications();
    refetchCount();
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllRead] = useMutation(MARK_ALL_READ);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  const notifications = notificationsData?.myNotifications?.results || [];
  const unreadCount = countData?.unreadNotificationCount || 0;

  const handleMarkRead = async (id: string) => {
    await markRead({ variables: { id } });
    refetchNotifications();
    refetchCount();
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    refetchNotifications();
    refetchCount();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteNotification({ variables: { id } });
    refetchNotifications();
    refetchCount();
  };

  const getIcon = (notif: any) => {
    if (notif.verb === "approved")
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (notif.verb === "rejected")
      return <XCircle className="h-4 w-4 text-destructive" />;
    return notif.isRead ? (
      <MailOpen className="h-4 w-4 text-muted-foreground" />
    ) : (
      <Mail className="h-4 w-4 text-primary" />
    );
  };

  const handleRedirect = (notif: any) => {
    if (notif.targetType === "Leave Request") {
      !notif.isRead && handleMarkRead(notif.id);
      router.push(`/leaves?tab=requests`);
    }
    if (notif.targetType === "Attendance Correction") {
      !notif.isRead && handleMarkRead(notif.id);
      router.push(`/attendance`);
    }
    if (notif.targetType === "Payroll") {
      !notif.isRead && handleMarkRead(notif.id);
      router.push(`/payroll`);
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="flex h-[min(28rem,70vh)] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-popover p-0 sm:w-96"
      >
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
        </DropdownMenuLabel>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {notifications.length > 0 ? (
            <div className="py-1">
              {notifications.map((notif: any) => (
                <DropdownMenuItem
                  key={notif.id}
                  className={cn(
                    "group mx-1 flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 focus:bg-muted",
                    !notif.isRead && "bg-primary/[0.04]"
                  )}
                  onClick={() => handleRedirect(notif)}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {getIcon(notif)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "line-clamp-2 text-sm leading-snug",
                        notif.isRead
                          ? "text-muted-foreground"
                          : "font-medium text-foreground"
                      )}
                    >
                      {notif.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      ·{" "}
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-focus:opacity-100 group-hover:opacity-100 [[data-highlighted]_&]:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
              <Bell className="mb-3 h-8 w-8 text-muted-foreground/35" />
              <p className="text-sm font-medium text-foreground">All caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">
                New alerts will show up here.
              </p>
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="shrink-0 p-2">
          <Link
            href="/notifications"
            className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
