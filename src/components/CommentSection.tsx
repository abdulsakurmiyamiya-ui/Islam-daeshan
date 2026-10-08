import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import { StorageService } from '../services/storageService';
import { MessageSquare, ThumbsUp, Flag, Trash2, Send, CornerDownRight } from 'lucide-react';
import { showToast } from '../utils/toast';

interface CommentSectionProps {
  chapterId: string;
  isAdmin?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  chapterId,
  isAdmin = false,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadComments = () => {
    setComments(StorageService.getComments(chapterId));
  };

  useEffect(() => {
    loadComments();
  }, [chapterId]);

  const handleSubmit = (parentId?: string) => {
    const text = parentId ? replyText : newCommentText;
    if (!text.trim()) {
      setErrorMsg('कृपया प्रतिक्रिया लेख्नुहोस्।');
      return;
    }

    const result = StorageService.addComment({
      chapterId,
      authorName: authorName || 'एक पाठक',
      commentText: text,
      parentId,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'प्रतिक्रिया पठाउन सकिएन।');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('तपाईंको प्रतिक्रिया प्रकाशित भयो!');
    setTimeout(() => setSuccessMsg(''), 3000);

    if (parentId) {
      setReplyingToId(null);
      setReplyText('');
    } else {
      setNewCommentText('');
    }
    loadComments();
  };

  const handleLike = (id: string) => {
    StorageService.likeComment(id);
    loadComments();
  };

  const handleReport = (id: string) => {
    StorageService.reportComment(id);
    loadComments();
    showToast('प्रतिक्रिया रिपोर्ट गरियो। समीक्षापछि आवश्यक कदम चालिनेछ।', 'info');
  };

  const handleDelete = (id: string) => {
    try {
      if (typeof window === 'undefined' || window.confirm('के तपाईं यो प्रतिक्रिया मेटाउन निश्चित हुनुहुन्छ?')) {
        StorageService.deleteComment(id);
        loadComments();
        showToast('प्रतिक्रिया मेटाइयो।', 'info');
      }
    } catch {
      StorageService.deleteComment(id);
      loadComments();
    }
  };

  // Group root comments and replies
  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div id="chapter-comments-section" className="my-8 pt-6 border-t border-stone-200 dark:border-stone-800">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#d97706]" />
          <h3 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">
            पाठकहरूको प्रतिक्रिया ({comments.length})
          </h3>
        </div>
        <span className="text-xs font-book text-stone-500">
          सभ्य र विचारशील छलफल
        </span>
      </div>

      {/* New Comment Box */}
      <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 mb-6">
        {errorMsg && (
          <div className="p-2 mb-2 rounded bg-rose-500/10 text-rose-600 text-xs font-book">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-2 mb-2 rounded bg-emerald-500/10 text-emerald-600 text-xs font-book">
            {successMsg}
          </div>
        )}

        <div className="mb-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="तपाईंको नाम (उदा. सुजन थापा)"
            className="w-full sm:w-64 p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-book text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="यस अध्यायबारे आफ्नो विचार वा प्रतिक्रिया व्यक्त गर्नुहोस्..."
          rows={2}
          className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm font-book text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d97706]"
        />

        <div className="mt-2 flex justify-end">
          <button
            onClick={() => handleSubmit()}
            className="px-4 py-1.5 rounded-lg text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>प्रतिक्रिया दिनुहोस्</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <p className="text-center py-6 text-xs sm:text-sm text-stone-500 font-book italic">
            अहिलेसम्म कुनै प्रतिक्रिया छैन। तपाईं पहिलो हुनुहोस्!
          </p>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(comment.id);
            return (
              <div
                key={comment.id}
                className="p-3.5 rounded-xl bg-white/70 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800/80 shadow-xs"
              >
                {/* Author row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px]">
                      {comment.authorName.charAt(0)}
                    </span>
                    <span className="font-heading font-bold text-stone-900 dark:text-stone-100">
                      {comment.authorName}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-book">
                    {comment.createdAt}
                  </span>
                </div>

                {/* Comment Text */}
                <p className="mt-2 text-xs sm:text-sm font-book text-stone-800 dark:text-stone-200 leading-relaxed pl-8">
                  {comment.commentText}
                </p>

                {/* Action Bar */}
                <div className="mt-3 flex items-center justify-between pl-8 text-xs font-book text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`inline-flex items-center gap-1 hover:text-emerald-600 transition cursor-pointer ${
                        comment.likedByMe ? 'text-emerald-600 font-bold' : ''
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{comment.likesCount}</span>
                    </button>

                    <button
                      onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                      className="hover:text-amber-600 transition cursor-pointer"
                    >
                      जवाफ दिनुहोस्
                    </button>

                    <button
                      onClick={() => handleReport(comment.id)}
                      title="अनुचित टिप्पणी रिपोर्ट गर्नुहोस्"
                      className="hover:text-rose-600 transition cursor-pointer flex items-center gap-0.5"
                    >
                      <Flag className="w-3 h-3" />
                      <span className="text-[11px]">रिपोर्ट</span>
                    </button>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-rose-600 hover:text-rose-700 transition cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" /> मेटाउनुहोस्
                    </button>
                  )}
                </div>

                {/* Reply Input Box */}
                {replyingToId === comment.id && (
                  <div className="mt-3 ml-8 p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`@${comment.authorName} लाई जवाफ दिनुहोस्...`}
                      rows={2}
                      className="w-full p-2 text-xs font-book rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                    <div className="mt-1.5 flex justify-end gap-2">
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="px-2.5 py-1 text-[11px] text-stone-500 cursor-pointer"
                      >
                        रद्द गर्नुहोस्
                      </button>
                      <button
                        onClick={() => handleSubmit(comment.id)}
                        className="px-3 py-1 text-[11px] font-heading font-semibold bg-emerald-800 text-white rounded cursor-pointer"
                      >
                        जवाफ पठाउनुहोस्
                      </button>
                    </div>
                  </div>
                )}

                {/* Render Nested Replies */}
                {replies.length > 0 && (
                  <div className="mt-3 ml-8 space-y-2.5 border-l-2 border-stone-200 dark:border-stone-800 pl-3">
                    {replies.map((reply) => (
                      <div key={reply.id} className="text-xs">
                        <div className="flex items-center gap-1.5 font-heading font-semibold text-stone-800 dark:text-stone-200">
                          <CornerDownRight className="w-3 h-3 text-amber-600" />
                          <span>{reply.authorName}</span>
                          <span className="text-[10px] text-stone-400 font-book ml-auto">
                            {reply.createdAt}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-stone-700 dark:text-stone-300 font-book pl-4">
                          {reply.commentText}
                        </p>
                        <div className="mt-1.5 pl-4 flex items-center gap-3 text-[11px] text-stone-500">
                          <button
                            onClick={() => handleLike(reply.id)}
                            className="inline-flex items-center gap-1 hover:text-emerald-600 cursor-pointer"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{reply.likesCount}</span>
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(reply.id)}
                              className="text-rose-600 cursor-pointer"
                            >
                              मेटाउनुहोस्
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
