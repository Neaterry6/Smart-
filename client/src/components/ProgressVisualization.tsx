import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Clock, CheckCircle, Star, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProgressVisualizationProps {
  userStats: {
    documentsUploaded: number;
    flashcardsCreated: number;
    flashcardsReviewed: number;
    quizzesCompleted: number;
    quizQuestionsAnswered: number;
    correctAnswers: number;
    totalStudyTime: number;
  };
  milestones?: {
    documentsUploaded: number[];
    flashcardsReviewed: number[];
    quizzesCompleted: number[];
    totalStudyTime: number[];
  };
}

// Default milestone values
const defaultMilestones = {
  documentsUploaded: [1, 5, 10, 25, 50],
  flashcardsReviewed: [10, 50, 100, 500, 1000],
  quizzesCompleted: [1, 5, 15, 30, 50],
  totalStudyTime: [60, 300, 600, 1800, 3600] // in minutes
};

export default function ProgressVisualization({ 
  userStats, 
  milestones = defaultMilestones 
}: ProgressVisualizationProps) {
  const [previousStats, setPreviousStats] = useState(userStats);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  // Check for milestones when stats change
  useEffect(() => {
    // Only run after initial render
    if (previousStats === userStats) {
      setPreviousStats(userStats);
      return;
    }
    
    // Check each stat for passing a milestone
    const checkMilestone = (
      statName: keyof typeof userStats,
      oldValue: number,
      newValue: number,
      milestonesArray: number[]
    ) => {
      // Find if we've crossed any milestone thresholds
      const passedMilestones = milestonesArray.filter(
        threshold => oldValue < threshold && newValue >= threshold
      );
      
      if (passedMilestones.length > 0) {
        // Get the highest milestone we've passed
        const highestMilestone = Math.max(...passedMilestones);
        
        // Create user-friendly stat name
        const readableStatName = statName
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, firstChar => firstChar.toUpperCase());
        
        setCelebrationMessage(`${readableStatName} milestone: ${highestMilestone}!`);
        setShowCelebration(true);
        
        // Show toast notification - commented out for now to avoid issues
        /*
        toast({
          title: "Milestone Achieved!",
          description: `${readableStatName} milestone: ${highestMilestone}!`,
          variant: "default",
        });
        */
        
        // Hide celebration after 3 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 3000);
      }
    };
    
    // Check each stat type
    checkMilestone('documentsUploaded', previousStats.documentsUploaded, userStats.documentsUploaded, milestones.documentsUploaded);
    checkMilestone('flashcardsReviewed', previousStats.flashcardsReviewed, userStats.flashcardsReviewed, milestones.flashcardsReviewed);
    checkMilestone('quizzesCompleted', previousStats.quizzesCompleted, userStats.quizzesCompleted, milestones.quizzesCompleted);
    checkMilestone('totalStudyTime', previousStats.totalStudyTime, userStats.totalStudyTime, milestones.totalStudyTime);
    
    // Update previous stats
    setPreviousStats(userStats);
  }, [userStats, milestones, previousStats]);
  
  // Calculate progress percentages
  const getProgress = (current: number, milestoneArray: number[]) => {
    // If we've exceeded the highest milestone, return 100%
    if (current >= Math.max(...milestoneArray)) {
      return 100;
    }
    
    // Find the next milestone we're working toward
    const nextMilestone = milestoneArray.find(m => m > current) || Math.max(...milestoneArray);
    // Find the previous milestone we've passed
    const previousMilestone = [...milestoneArray].reverse().find(m => m <= current) || 0;
    
    // Calculate progress between these two milestones
    const range = nextMilestone - previousMilestone;
    const progress = current - previousMilestone;
    return Math.min(Math.round((progress / range) * 100), 100);
  };
  
  // For each stat, get the next milestone
  const getNextMilestone = (current: number, milestoneArray: number[]) => {
    return milestoneArray.find(m => m > current) || "All milestones completed!";
  };
  
  // Format study time for display (minutes to hours and minutes)
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Study Progress</h2>
      
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-primary/20 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-center"
              >
                <Star className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary mb-2">Milestone Achieved!</h3>
                <p className="text-lg">{celebrationMessage}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documents Uploaded Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary" />
              Documents Uploaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{userStats.documentsUploaded}</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
            >
              <Progress 
                value={getProgress(userStats.documentsUploaded, milestones.documentsUploaded)} 
                className="h-2 mb-2"
              />
            </motion.div>
            <div className="text-sm text-muted-foreground">
              Next milestone: {getNextMilestone(userStats.documentsUploaded, milestones.documentsUploaded)}
            </div>
          </CardContent>
        </Card>
        
        {/* Flashcards Reviewed Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary" />
              Flashcards Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{userStats.flashcardsReviewed}</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
            >
              <Progress 
                value={getProgress(userStats.flashcardsReviewed, milestones.flashcardsReviewed)} 
                className="h-2 mb-2"
              />
            </motion.div>
            <div className="text-sm text-muted-foreground">
              Next milestone: {getNextMilestone(userStats.flashcardsReviewed, milestones.flashcardsReviewed)}
            </div>
          </CardContent>
        </Card>
        
        {/* Quizzes Completed Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary" />
              Quizzes Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{userStats.quizzesCompleted}</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
            >
              <Progress 
                value={getProgress(userStats.quizzesCompleted, milestones.quizzesCompleted)} 
                className="h-2 mb-2"
              />
            </motion.div>
            <div className="text-sm text-muted-foreground">
              Next milestone: {getNextMilestone(userStats.quizzesCompleted, milestones.quizzesCompleted)}
            </div>
          </CardContent>
        </Card>
        
        {/* Study Time Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Total Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatStudyTime(userStats.totalStudyTime)}</div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
            >
              <Progress 
                value={getProgress(userStats.totalStudyTime, milestones.totalStudyTime)} 
                className="h-2 mb-2"
              />
            </motion.div>
            <div className="text-sm text-muted-foreground">
              Next milestone: {
                typeof getNextMilestone(userStats.totalStudyTime, milestones.totalStudyTime) === 'number' 
                  ? formatStudyTime(getNextMilestone(userStats.totalStudyTime, milestones.totalStudyTime) as number) 
                  : getNextMilestone(userStats.totalStudyTime, milestones.totalStudyTime)
              }
            </div>
          </CardContent>
        </Card>
        
        {/* Quiz Accuracy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Quiz Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {userStats.quizQuestionsAnswered > 0 
                ? `${Math.round((userStats.correctAnswers / userStats.quizQuestionsAnswered) * 100)}%`
                : '0%'
              }
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
            >
              <Progress 
                value={userStats.quizQuestionsAnswered > 0 
                  ? Math.round((userStats.correctAnswers / userStats.quizQuestionsAnswered) * 100)
                  : 0
                } 
                className="h-2 mb-2"
              />
            </motion.div>
            <div className="text-sm text-muted-foreground">
              {userStats.correctAnswers} correct out of {userStats.quizQuestionsAnswered} questions
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}