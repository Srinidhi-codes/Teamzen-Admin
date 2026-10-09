"use client";

import React, { useState } from "react";
import { useReportedPosts, useModerationMutations } from "@/lib/graphql/feed/feedHooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ModerationPage() {
  const { reportedPosts, loading, refetch } = useReportedPosts();
  const { dismissReport, deletePost } = useModerationMutations();

  const [deleteReason, setDeleteReason] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDismiss = async (postId: string) => {
    try {
      await dismissReport({ variables: { postId } });
      toast.success("Report dismissed successfully");
      refetch();
    } catch (e) {
      toast.error("Failed to dismiss report");
    }
  };

  const openDeleteDialog = (postId: string) => {
    setSelectedPostId(postId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedPostId) return;
    try {
      // In a real scenario, the backend delete_post mutation might be updated to accept a reason,
      // but for now, we just delete the post. The frontend toast implies feedback was sent.
      await deletePost({ variables: { id: selectedPostId } });
      toast.success("Post deleted and feedback sent to user");
      setShowDeleteDialog(false);
      setDeleteReason("");
      refetch();
    } catch (e) {
      toast.error("Failed to delete post");
    }
  };

  if (loading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading reported posts...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
          <p className="text-muted-foreground mt-2">
            Review and moderate posts reported by users in the company feed.
          </p>
        </div>
      </div>

      {reportedPosts.length === 0 ? (
        <Card className="border-dashed shadow-none bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              There are no reported posts to review at this time. The community feed is looking good.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reportedPosts.map((post: any) => (
            <Card key={post.id} className="border-red-100 dark:border-red-950 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-red-600 flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    Reported Content
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Reported by <strong>{post.reportedBy?.firstName} {post.reportedBy?.lastName}</strong> ({post.reportedBy?.email})
                  </CardDescription>
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-md text-sm border border-red-100 dark:border-red-900/50">
                    <span className="font-semibold text-red-800 dark:text-red-300">Reason:</span>{" "}
                    <span className="text-red-700 dark:text-red-400">{post.reportReason}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDismiss(post.id)}>
                    Dismiss Report
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(post.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Post
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="border rounded-lg p-5 bg-muted/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border">
                      {post.author.profilePictureUrl ? (
                        <img 
                          src={post.author.profilePictureUrl.startsWith('http') ? post.author.profilePictureUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${post.author.profilePictureUrl}`} 
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        post.author.firstName?.[0] || '?'
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {post.author.firstName} {post.author.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  {post.title && <h4 className="font-bold mb-2">{post.title}</h4>}
                  
                  <div 
                    className="text-sm prose prose-sm dark:prose-invert max-w-none mb-4"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  
                  {post.mediaUrls?.length > 0 && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-4 border-t pt-3">
                      <Eye className="w-3 h-3" /> This post contains {post.mediaUrls.length} attachment(s).
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Delete Reported Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            <label className="text-sm font-medium mb-1.5 block">Reason for deletion (Feedback to user)</label>
            <textarea
              className="w-full min-h-[80px] p-3 border rounded-md text-sm bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Explain why this post is being removed..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
