import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Music, Sparkles, Loader2, Upload } from 'lucide-react';
import { PanicPracticeMode, ComposerMode, TheoryTeacherMode, FullScorePlayer, MusicSheetUpload, TheoryCourse } from '@/components/music';
import ReactMarkdown from 'react-markdown';
import { SONG_LIBRARY, Song } from '@/types/music';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  component?: {
    type: 'panic-practice' | 'composer' | 'theory-teacher' | 'full-score' | 'upload-sheet' | 'theory-course';
    props: Record<string, unknown>;
  };
}

export function MaestroChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to **Maestro AI**! 🎵\n\nI'm your adaptive music workspace. Just tell me what you need:\n\n• \"Help me practice the Alto line for Amazing Grace\" → Practice mode\n• \"I have a melody idea: D F# A D\" → Composer mode\n• \"Why does that chord sound so sad?\" → Theory mode\n• \"Upload a music sheet\" → Import PDF, image, or MIDI\n\nThe right tools will appear automatically!",
    },
  ]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Check for upload intent locally (no AI needed)
      const lowerInput = currentInput.toLowerCase();
      
      // Check for theory course intent
      if (
        lowerInput.includes('theory course') ||
        lowerInput.includes('learn theory') ||
        lowerInput.includes('music theory course') ||
        lowerInput.includes('comprehensive theory') ||
        lowerInput.includes('theory curriculum')
      ) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Welcome to the **Theory Course**! 📚\n\nI've opened the comprehensive music theory curriculum with lessons for beginners, intermediate, and expert levels. Each category includes interactive lessons, common problems, and you can ask me for personalized help anytime!",
          component: { type: 'theory-course', props: {} },
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }
      
      if (
        lowerInput.includes('upload') ||
        lowerInput.includes('scan') ||
        lowerInput.includes('import') ||
        lowerInput.includes('pdf') ||
        lowerInput.includes('midi') ||
        lowerInput.includes('sheet music file')
      ) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I've opened the **Music Sheet Upload** tool! 📄 Drag and drop your PDF, image, or MIDI file and I'll transcribe it into playable notation.",
          component: { type: 'upload-sheet', props: {} },
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke('maestro-chat', {
        body: {
          messages: conversationHistory.slice(-10), // Last 10 messages for context
          userMessage: currentInput,
        },
      });

      if (error) throw error;

      const aiResponse = data as {
        content: string;
        component?: { type: string; props: Record<string, unknown> } | null;
      };

      // Update conversation history
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', content: currentInput },
        { role: 'assistant', content: aiResponse.content },
      ]);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        component: aiResponse.component
          ? {
              type: aiResponse.component.type as Message['component']['type'],
              props: aiResponse.component.props || {},
            }
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I had a brief moment of stage fright! 😅 Could you try asking again? I'm here to help with practice, composition, or music theory.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderComponent = (component: Message['component']) => {
    if (!component) return null;

    switch (component.type) {
      case 'panic-practice':
        return <PanicPracticeMode {...(component.props as any)} />;
      case 'composer':
        return <ComposerMode {...(component.props as any)} />;
      case 'theory-teacher':
        return <TheoryTeacherMode {...(component.props as any)} />;
      case 'full-score':
        return <FullScorePlayer {...(component.props as any)} />;
      case 'upload-sheet':
        return (
          <MusicSheetUpload
            onSheetProcessed={(sheet) => {
              const newSong: Song = {
                id: sheet.id,
                title: sheet.title,
                composer: sheet.composer,
                key: sheet.key_signature,
                tempo: sheet.tempo,
                timeSignature: sheet.time_signature,
                parts: sheet.parts as any,
                partNotes: sheet.part_notes as any,
              };
              SONG_LIBRARY.push(newSong);

              const practiceMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `🎉 **"${sheet.title}"** has been transcribed and loaded!\n\nDetected parts: ${Object.keys(sheet.parts).map(p => `**${p.charAt(0).toUpperCase() + p.slice(1)}**`).join(', ')}\n\nYou can now ask me to practice any part, for example:\n• "Show me the Soprano line for ${sheet.title}"`,
                component: {
                  type: 'panic-practice',
                  props: {
                    songTitle: sheet.title,
                    voicePart: Object.keys(sheet.parts)[0] || 'soprano',
                    tempo: sheet.tempo,
                  },
                },
              };
              setMessages((prev) => [...prev, practiceMsg]);
            }}
          />
        );
      case 'theory-course':
        return (
          <TheoryCourse
            onAskAI={(question) => {
              setInput(question);
              handleSubmit();
            }}
            {...(component.props as any)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto py-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3'
                      : 'space-y-4'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/20 shrink-0">
                        <Music className="w-4 h-4 text-primary" />
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <p className="text-sm">{message.content}</p>
                  )}
                  {message.component && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4"
                    >
                      {renderComponent(message.component)}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-full bg-primary/20">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
              <span className="text-sm text-muted-foreground">Maestro is thinking...</span>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Maestro anything about music..."
              className="min-h-[60px] pr-12 resize-none bg-background border-border"
              rows={2}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setInput("Help me practice the Alto line for Amazing Grace")}
            >
              <Sparkles className="w-3 h-3" />
              Practice Alto
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setInput("Practice the Soprano part for Sample 2")}
            >
              <Sparkles className="w-3 h-3" />
              Sample 2 Soprano
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setInput("I have a melody idea: C D E F G A B C5")}
            >
              <Sparkles className="w-3 h-3" />
              Compose
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setInput("Why does a minor chord sound sad?")}
            >
              <Sparkles className="w-3 h-3" />
              Theory
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setInput("Open the theory course")}
            >
              <Sparkles className="w-3 h-3" />
              Theory Course
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setInput("Upload a music sheet")}
            >
              <Upload className="w-3 h-3" />
              Upload Sheet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
