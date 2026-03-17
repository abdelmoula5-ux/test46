import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Eye, EyeOff, Mail, MailOpen } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import type { Json } from '@/integrations/supabase/types';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  // Quiz creation state
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', type: 'quiz' as 'quiz' | 'survey' });
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({ question_text: '', question_type: 'multiple_choice', options: '', correct_answer: '' });

  const { data: quizzes } = useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: questions } = useQuery({
    queryKey: ['admin-questions', editingQuizId],
    queryFn: async () => {
      const { data, error } = await supabase.from('questions').select('*').eq('quiz_id', editingQuizId!).order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!editingQuizId,
  });

  const { data: messages } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: responses } = useQuery({
    queryKey: ['admin-responses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('responses').select('*, quizzes(title)').order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const createQuiz = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('quizzes').insert({
        ...newQuiz,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-quizzes'] });
      setNewQuiz({ title: '', description: '', type: 'quiz' });
      toast({ title: 'Quiz created!' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from('quizzes').update({ is_published: !published }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-quizzes'] }),
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-quizzes'] });
      setEditingQuizId(null);
    },
  });

  const addQuestion = useMutation({
    mutationFn: async () => {
      const optionsArray = newQuestion.options.split(',').map((o) => o.trim()).filter(Boolean);
      const { error } = await supabase.from('questions').insert({
        quiz_id: editingQuizId!,
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type,
        options: optionsArray as unknown as Json,
        correct_answer: newQuestion.correct_answer || null,
        order_index: (questions?.length ?? 0),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-questions', editingQuizId] });
      setNewQuestion({ question_text: '', question_type: 'multiple_choice', options: '', correct_answer: '' });
      toast({ title: 'Question added!' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-questions', editingQuizId] }),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  if (loading) return <Layout><div className="min-h-[60vh] flex items-center justify-center"><p>Loading...</p></div></Layout>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

          <Tabs defaultValue="quizzes" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="quizzes">Quizzes & Surveys</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
              <TabsTrigger value="messages">Messages ({messages?.filter(m => !m.is_read).length ?? 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="quizzes" className="space-y-6">
              {/* Create new quiz */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">Create New Quiz/Survey</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input value={newQuiz.title} onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <select
                      value={newQuiz.type}
                      onChange={(e) => setNewQuiz({ ...newQuiz, type: e.target.value as 'quiz' | 'survey' })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="quiz">Quiz</option>
                      <option value="survey">Survey</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Description</Label>
                  <Textarea value={newQuiz.description} onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })} />
                </div>
                <Button onClick={() => createQuiz.mutate()} disabled={!newQuiz.title} className="mt-4 gradient-coral border-0 text-accent-foreground">
                  <Plus className="w-4 h-4 mr-2" /> Create
                </Button>
              </div>

              {/* Quiz list */}
              <div className="space-y-3">
                {quizzes?.map((quiz) => (
                  <div key={quiz.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-coral">{quiz.type}</span>
                        {quiz.is_published && <span className="text-xs bg-coral/10 text-coral px-2 py-0.5 rounded-full">Published</span>}
                      </div>
                      <h4 className="font-display font-semibold text-foreground truncate">{quiz.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingQuizId(editingQuizId === quiz.id ? null : quiz.id)}>
                        Edit Questions
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => togglePublish.mutate({ id: quiz.id, published: quiz.is_published })}>
                        {quiz.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteQuiz.mutate(quiz.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Question editor */}
              {editingQuizId && (
                <div className="bg-secondary rounded-xl p-6 space-y-4">
                  <h3 className="font-display font-semibold text-foreground">
                    Questions for: {quizzes?.find(q => q.id === editingQuizId)?.title}
                  </h3>

                  {questions?.map((q, i) => (
                    <div key={q.id} className="bg-card rounded-lg p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground"><span className="text-coral">{i + 1}.</span> {q.question_text}</p>
                        <p className="text-xs text-muted-foreground mt-1">Type: {q.question_type} | Options: {Array.isArray(q.options) ? (q.options as string[]).join(', ') : 'N/A'}</p>
                        {q.correct_answer && <p className="text-xs text-coral">Answer: {q.correct_answer}</p>}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteQuestion.mutate(q.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  <div className="border-t border-border pt-4 space-y-3">
                    <h4 className="font-display font-medium text-foreground">Add Question</h4>
                    <Input
                      placeholder="Question text"
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                    />
                    <div className="grid sm:grid-cols-3 gap-3">
                      <select
                        value={newQuestion.question_type}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="text">Text</option>
                        <option value="rating">Rating</option>
                      </select>
                      <Input
                        placeholder="Options (comma separated)"
                        value={newQuestion.options}
                        onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                      />
                      <Input
                        placeholder="Correct answer (quizzes)"
                        value={newQuestion.correct_answer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                      />
                    </div>
                    <Button onClick={() => addQuestion.mutate()} disabled={!newQuestion.question_text} className="gradient-coral border-0 text-accent-foreground">
                      <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="responses" className="space-y-3">
              {responses?.length === 0 && <p className="text-muted-foreground py-8 text-center">No responses yet.</p>}
              {responses?.map((r) => (
                <div key={r.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display font-semibold text-foreground">{(r as any).quizzes?.title}</h4>
                    {r.score !== null && <span className="text-sm font-medium text-coral">Score: {r.score}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(r.submitted_at).toLocaleDateString()}
                  </p>
                  <pre className="text-xs text-muted-foreground mt-2 bg-secondary rounded p-2 overflow-auto">
                    {JSON.stringify(r.answers, null, 2)}
                  </pre>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="messages" className="space-y-3">
              {messages?.length === 0 && <p className="text-muted-foreground py-8 text-center">No messages yet.</p>}
              {messages?.map((m) => (
                <div key={m.id} className={`bg-card rounded-xl border p-4 ${m.is_read ? 'border-border' : 'border-coral/30'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {m.is_read ? <MailOpen className="w-4 h-4 text-muted-foreground" /> : <Mail className="w-4 h-4 text-coral" />}
                        <h4 className="font-display font-semibold text-foreground truncate">{m.subject}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">From: {m.name} ({m.email})</p>
                      <p className="text-sm text-foreground mt-2">{m.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(m.created_at).toLocaleString()}</p>
                    </div>
                    {!m.is_read && (
                      <Button size="sm" variant="outline" onClick={() => markRead.mutate(m.id)}>Mark Read</Button>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
