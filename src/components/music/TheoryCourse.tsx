import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  ChevronRight, 
  ChevronDown,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { InteractivePiano } from './InteractivePiano';
import {
  SkillLevel,
  TheoryLesson,
  THEORY_CATEGORIES,
  BEGINNER_LESSONS,
  INTERMEDIATE_LESSONS,
  EXPERT_LESSONS,
  COMMON_PROBLEMS,
  getLessonsForCategory,
} from '@/types/theory';

interface TheoryCourseProps {
  onAskAI?: (question: string) => void;
  initialLevel?: SkillLevel;
}

export function TheoryCourse({ 
  onAskAI,
  initialLevel = 'beginner',
}: TheoryCourseProps) {
  const [activeLevel, setActiveLevel] = useState<SkillLevel>(initialLevel);
  const [selectedLesson, setSelectedLesson] = useState<TheoryLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Get lessons for current level
  const currentLessons = useMemo(() => {
    switch (activeLevel) {
      case 'beginner':
        return BEGINNER_LESSONS;
      case 'intermediate':
        return INTERMEDIATE_LESSONS;
      case 'expert':
        return EXPERT_LESSONS;
      default:
        return [];
    }
  }, [activeLevel]);

  // Group lessons by category
  const lessonsByCategory = useMemo(() => {
    const grouped = new Map<string, TheoryLesson[]>();
    currentLessons.forEach((lesson) => {
      const existing = grouped.get(lesson.category) || [];
      grouped.set(lesson.category, [...existing, lesson]);
    });
    return grouped;
  }, [currentLessons]);

  // Calculate progress
  const progressPercentage = useMemo(() => {
    const totalLessons = currentLessons.length;
    const completed = currentLessons.filter((l) => completedLessons.has(l.id)).length;
    return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  }, [currentLessons, completedLessons]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => new Set(prev).add(lessonId));
  };

  const handleAskAI = (topic: string) => {
    if (onAskAI) {
      onAskAI(`Explain ${topic} in music theory with examples`);
    }
  };

  const levelConfig = {
    beginner: {
      icon: <BookOpen className="w-4 h-4" />,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
    },
    intermediate: {
      icon: <GraduationCap className="w-4 h-4" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
    },
    expert: {
      icon: <Trophy className="w-4 h-4" />,
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-musical-teal/20 text-musical-teal text-sm font-medium">
            📚 Theory Course
          </div>
          <span className="text-sm text-muted-foreground">
            Comprehensive music theory curriculum
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Progress:</span>
          <Progress value={progressPercentage} className="w-24 h-2" />
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>
      </motion.div>

      {/* Level Tabs */}
      <Tabs value={activeLevel} onValueChange={(v) => setActiveLevel(v as SkillLevel)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="beginner" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Beginner
          </TabsTrigger>
          <TabsTrigger value="intermediate" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Intermediate
          </TabsTrigger>
          <TabsTrigger value="expert" className="gap-2">
            <Trophy className="w-4 h-4" />
            Expert
          </TabsTrigger>
        </TabsList>

        {/* Content for each level */}
        {(['beginner', 'intermediate', 'expert'] as SkillLevel[]).map((level) => (
          <TabsContent key={level} value={level} className="space-y-4">
            {/* Common Problems Section */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  Common Problems for {level.charAt(0).toUpperCase() + level.slice(1)}s
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {COMMON_PROBLEMS[level].map((problem, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background transition-colors"
                      onClick={() => handleAskAI(problem)}
                    >
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{problem}</span>
                    </div>
                  ))}
                </div>
                {onAskAI && (
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 Click any problem to ask the AI for help
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Lesson Categories */}
            <div className="space-y-3">
              {THEORY_CATEGORIES.filter((cat) => lessonsByCategory.has(cat.id)).map((category) => (
                <Collapsible
                  key={category.id}
                  open={expandedCategories.has(category.id)}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <Card className="border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <CardTitle className="text-base font-medium">
                                {category.name}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">
                                {category.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {lessonsByCategory.get(category.id)?.length || 0} lessons
                            </Badge>
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <ScrollArea className="max-h-[300px]">
                          <div className="space-y-2">
                            {lessonsByCategory.get(category.id)?.map((lesson) => (
                              <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`
                                  p-3 rounded-lg border cursor-pointer transition-all
                                  ${selectedLesson?.id === lesson.id 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                                  }
                                `}
                                onClick={() => setSelectedLesson(lesson)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {completedLessons.has(lesson.id) ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <Play className="w-5 h-5 text-muted-foreground" />
                                    )}
                                    <div>
                                      <h4 className="text-sm font-medium">{lesson.title}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {lesson.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Selected Lesson Detail */}
      {selectedLesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                <Badge 
                    variant="outline"
                    className="mb-2"
                  >
                    {levelConfig[selectedLesson.level].icon}
                    <span className="ml-1 capitalize">{selectedLesson.level}</span>
                  </Badge>
                  <CardTitle className="text-lg">{selectedLesson.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedLesson.description}
                  </p>
                </div>
                <Button
                  variant={completedLessons.has(selectedLesson.id) ? 'outline' : 'default'}
                  onClick={() => handleLessonComplete(selectedLesson.id)}
                >
                  {completedLessons.has(selectedLesson.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Learning Objectives */}
              <div>
                <h4 className="text-sm font-medium mb-2">Learning Objectives</h4>
                <ul className="space-y-1">
                  {selectedLesson.objectives.map((obj, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Content Sections */}
              {selectedLesson.content.sections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm font-medium">{section.heading}</h4>
                  <p className="text-sm text-muted-foreground">{section.text}</p>
                  
                  {/* Interactive element */}
                  {section.interactiveElement === 'piano' && (
                    <div className="mt-3">
                      <InteractivePiano octaves={2} startOctave={4} />
                    </div>
                  )}
                </div>
              ))}

              {/* AI Help Button */}
              {onAskAI && (
                <div className="pt-4 border-t">
                  <Button
                    variant="secondary"
                    className="gap-2 w-full"
                    onClick={() => handleAskAI(selectedLesson.title)}
                  >
                    <Sparkles className="w-4 h-4" />
                    Ask AI for More Help on This Topic
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI-powered suggestions */}
      {onAskAI && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-medium">AI-Powered Learning</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Ask the AI for personalized explanations, additional examples, or help with specific concepts.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleAskAI('circle of fifths')}>
                Circle of Fifths
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAskAI('chord inversions')}>
                Chord Inversions
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAskAI('relative major and minor')}>
                Relative Keys
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAskAI('syncopation examples')}>
                Syncopation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
