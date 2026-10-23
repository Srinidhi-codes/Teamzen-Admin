"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useReportedPosts, useReportedComments, useModerationMutations } from "@/lib/graphql/feed/feedHooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Trash2, Eye, MessageSquare, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination } from "@/components/common/Pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";

export default function ModerationPage() {
  const { reportedPosts, loading: loadingPosts, refetch: refetchPosts } = useReportedPosts();
  const { reportedComments, loading: loadingComments, refetch: refetchComments } = useReportedComments();
  const { dismissReport, deletePost, dismissCommentReport, deleteComment } = useModerationMutations();

  const [activeTab, setActiveTab] = useState("posts");
  const [postPage, setPostPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setPostPage(1);
  }, [reportedPosts.length]);

  useEffect(() => {
    setCommentPage(1);
  }, [reportedComments.length]);

  const totalPostPages = Math.ceil(reportedPosts.length / pageSize) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (postPage - 1) * pageSize;
    return reportedPosts.slice(start, start + pageSize);
  }, [reportedPosts, postPage, pageSize]);

  const totalCommentPages = Math.ceil(reportedComments.length / pageSize) || 1;
  const paginatedComments = useMemo(() => {
    const start = (commentPage - 1) * pageSize;
    return reportedComments.slice(start, start + pageSize);
  }, [reportedComments, commentPage, pageSize]);

  const [deleteReason, setDeleteReason] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: "post" | "comment" } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDismissPost = async (postId: string) => {
    try {
      await dismissReport({ variables: { postId } });
      toast.success("Post report dismissed successfully");
      refetchPosts();
    } catch {
      toast.error("Failed to dismiss post report");
    }
  };

  const handleDismissComment = async (commentId: string) => {
    try {
      await dismissCommentReport({ variables: { commentId } });
      toast.success("Comment report dismissed successfully");
      refetchComments();
    } catch {
      toast.error("Failed to dismiss comment report");
    }
  };

  const openDeleteDialog = (id: string, type: "post" | "comment") => {
    setSelectedItem({ id, type });
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      if (selectedItem.type === "post") {
        await deletePost({ variables: { id: selectedItem.id } });
        toast.success("Post deleted successfully");
        refetchPosts();
      } else {
        await deleteComment({ variables: { id: selectedItem.id } });
        toast.success("Comment deleted successfully");
        refetchComments();
      }
      setShowDeleteDialog(false);
      setDeleteReason("");
      setSelectedItem(null);
    } catch {
      toast.error(`Failed to delete ${selectedItem.type}`);
    }
  };

  const loading = loadingPosts || loadingComments;

  if (loading && reportedPosts.length === 0 && reportedComments.length === 0) {
    return <div className="p-8 animate-pulse text-gray-500">Loading reported content...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Content Moderation"
        description="Review and moderate posts and comments reported by users in the company feed."
        className="mb-6"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="posts" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer">
            <FileText className="w-4 h-4" />
            <span>Reported Posts</span>
            {reportedPosts.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                {reportedPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer">
            <MessageSquare className="w-4 h-4" />
            <span>Reported Comments</span>
            {reportedComments.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                {reportedComments.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Posts Tab ── */}
        <TabsContent value="posts">
          {reportedPosts.length === 0 ? (
            <Card className="border-dashed shadow-none bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">No Reported Posts</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  There are no reported posts to review at this time. The community feed is looking good.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6">
                {paginatedPosts.map((post: any) => (
                  <Card key={post.id} className="border-red-100 dark:border-red-950 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-red-600 flex items-center gap-2 text-lg">
                          <AlertTriangle className="h-5 w-5" />
                          Reported Post
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
                        <Button variant="outline" size="sm" onClick={() => handleDismissPost(post.id)}>
                          Dismiss Report
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(post.id, "post")}>
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
                          className="text-sm prose prose-sm dark:prose-invert max-w-none mb-4 [&_img]:w-full [&_img]:rounded-xl [&_img]:my-3 [&_img]:h-auto [&_img]:max-h-none [&_img]:object-contain [&_img]:block"
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

              {totalPostPages > 1 && (
                <div className="pt-2">
                  <Pagination
                    currentPage={postPage}
                    totalPages={totalPostPages}
                    onPageChange={setPostPage}
                    total={reportedPosts.length}
                    pageSize={pageSize}
                    label="reported posts"
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Comments Tab ── */}
        <TabsContent value="comments">
          {reportedComments.length === 0 ? (
            <Card className="border-dashed shadow-none bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">No Reported Comments</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  There are no reported comments to review at this time. All discussions are civil and healthy.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6">
                {paginatedComments.map((comment: any) => (
                  <Card key={comment.id} className="border-red-100 dark:border-red-950 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-red-600 flex items-center gap-2 text-lg">
                          <AlertTriangle className="h-5 w-5" />
                          Reported Comment
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Reported by <strong>{comment.reportedBy?.firstName} {comment.reportedBy?.lastName}</strong> ({comment.reportedBy?.email})
                        </CardDescription>
                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-md text-sm border border-red-100 dark:border-red-900/50">
                          <span className="font-semibold text-red-800 dark:text-red-300">Reason:</span>{" "}
                          <span className="text-red-700 dark:text-red-400">{comment.reportReason}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDismissComment(comment.id)}>
                          Dismiss Report
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(comment.id, "comment")}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete Comment
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="border rounded-lg p-4 bg-muted/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border text-xs">
                            {comment.author.profilePictureUrl ? (
                              <img 
                                src={comment.author.profilePictureUrl.startsWith('http') ? comment.author.profilePictureUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${comment.author.profilePictureUrl}`} 
                                alt="avatar"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              comment.author.firstName?.[0] || '?'
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {comment.author.firstName} {comment.author.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Commented {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        <div 
                          className="text-sm prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalCommentPages > 1 && (
                <div className="pt-2">
                  <Pagination
                    currentPage={commentPage}
                    totalPages={totalCommentPages}
                    onPageChange={setCommentPage}
                    total={reportedComments.length}
                    pageSize={pageSize}
                    label="reported comments"
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Delete Reported {selectedItem?.type === "post" ? "Post" : "Comment"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {selectedItem?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            <label className="text-sm font-medium mb-1.5 block">Reason for deletion (Feedback to user)</label>
            <textarea
              className="w-full min-h-[80px] p-3 border rounded-md text-sm bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder={`Explain why this ${selectedItem?.type || "content"} is being removed...`}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete {selectedItem?.type === "post" ? "Post" : "Comment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
