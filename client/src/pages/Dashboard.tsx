import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Badge, UserStats, Document } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Award, BookOpen, Clock, FileText, Star, Trophy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Achievement {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: Date;
  badge: Badge;
}

interface DashboardData {
  stats: UserStats;
  recentDocuments: Document[];
  achievements: Achievement[];
  documentsCount: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const data = await apiRequest<DashboardData>("/api/dashboard", { method: "GET" });
      return data as DashboardData;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please login to view your dashboard
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/auth">
                <a className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Go to Login
                </a>
              </Link>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Learning Dashboard</h1>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm text-muted-foreground">Loading your dashboard...</p>
              </div>
            </div>
          ) : dashboardData ? (
            <>
              <TabsContent value="overview">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Stats Summary */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Your Stats</CardTitle>
                      <CardDescription>Overview of your learning activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Documents</span>
                          </div>
                          <span className="text-sm font-bold">{dashboardData.stats.documentsUploaded}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Flashcards Reviewed</span>
                          </div>
                          <span className="text-sm font-bold">{dashboardData.stats.flashcardsReviewed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Quizzes Completed</span>
                          </div>
                          <span className="text-sm font-bold">{dashboardData.stats.quizzesCompleted}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Study Time</span>
                          </div>
                          <span className="text-sm font-bold">{dashboardData.stats.totalStudyTime} mins</span>
                        </div>
                        {dashboardData.stats.quizQuestionsAnswered > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Quiz Accuracy</span>
                              <span className="text-sm font-bold">
                                {Math.round((dashboardData.stats.correctAnswers / dashboardData.stats.quizQuestionsAnswered) * 100)}%
                              </span>
                            </div>
                            <Progress value={(dashboardData.stats.correctAnswers / dashboardData.stats.quizQuestionsAnswered) * 100} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recent Achievements */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Recent Achievements</CardTitle>
                      <CardDescription>Your latest learning badges</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData.achievements.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardData.achievements.slice(0, 3).map((achievement) => (
                            <div key={achievement.id} className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <span className="text-xl">{achievement.badge.icon}</span>
                              </div>
                              <div>
                                <p className="font-medium">{achievement.badge.name}</p>
                                <p className="text-xs text-muted-foreground">{achievement.badge.description}</p>
                              </div>
                            </div>
                          ))}
                          {dashboardData.achievements.length > 3 && (
                            <p className="text-sm text-center text-muted-foreground">
                              +{dashboardData.achievements.length - 3} more achievements
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[150px] text-center">
                          <Award className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Complete learning activities to earn badges</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <button 
                        className="text-sm text-primary w-full text-center"
                        onClick={() => setActiveTab("achievements")}
                      >
                        View all achievements
                      </button>
                    </CardFooter>
                  </Card>
                  
                  {/* Recent Documents */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Recent Documents</CardTitle>
                      <CardDescription>Your recently uploaded study materials</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData.recentDocuments.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardData.recentDocuments.slice(0, 4).map((doc) => (
                            <div key={doc.id} className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 truncate">
                                <Link href={`/document/${doc.id}`}>
                                  <a className="font-medium hover:underline truncate block">{doc.originalName}</a>
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(doc.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                              <BadgeUI variant={doc.processingStatus === "completed" ? "default" : "outline"}>
                                {doc.processingStatus}
                              </BadgeUI>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[150px] text-center">
                          <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Link href="/upload" className="text-sm text-primary w-full text-center">
                        Upload a new document
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="achievements">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {dashboardData.achievements.length > 0 ? (
                    dashboardData.achievements.map((achievement) => (
                      <Card key={achievement.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-2xl">{achievement.badge.icon}</span>
                            </div>
                            <div>
                              <CardTitle className="text-xl">{achievement.badge.name}</CardTitle>
                              <BadgeUI variant="outline" className="mt-1">
                                {achievement.badge.category}
                              </BadgeUI>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.badge.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 flex flex-col items-center justify-center p-12 text-center">
                      <Award className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Achievements Yet</h3>
                      <p className="text-muted-foreground max-w-md">
                        Complete learning activities like reviewing flashcards, taking quizzes, and uploading documents to earn achievement badges.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="progress">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Learning Progress */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Learning Progress</CardTitle>
                      <CardDescription>Track your study progress over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Documents Processed</span>
                            </div>
                            <span className="text-sm font-bold">{dashboardData.stats.documentsUploaded}</span>
                          </div>
                          <Progress value={Math.min(dashboardData.stats.documentsUploaded / 10 * 100, 100)} />
                          <p className="text-xs text-muted-foreground text-right">
                            {dashboardData.stats.documentsUploaded}/10 for highest badge
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Flashcards Reviewed</span>
                            </div>
                            <span className="text-sm font-bold">{dashboardData.stats.flashcardsReviewed}</span>
                          </div>
                          <Progress value={Math.min(dashboardData.stats.flashcardsReviewed / 100 * 100, 100)} />
                          <p className="text-xs text-muted-foreground text-right">
                            {dashboardData.stats.flashcardsReviewed}/100 for highest badge
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Quizzes Completed</span>
                            </div>
                            <span className="text-sm font-bold">{dashboardData.stats.quizzesCompleted}</span>
                          </div>
                          <Progress value={Math.min(dashboardData.stats.quizzesCompleted / 10 * 100, 100)} />
                          <p className="text-xs text-muted-foreground text-right">
                            {dashboardData.stats.quizzesCompleted}/10 for highest badge
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Study Time (minutes)</span>
                            </div>
                            <span className="text-sm font-bold">{dashboardData.stats.totalStudyTime}</span>
                          </div>
                          <Progress value={Math.min(dashboardData.stats.totalStudyTime / 600 * 100, 100)} />
                          <p className="text-xs text-muted-foreground text-right">
                            {dashboardData.stats.totalStudyTime}/600 minutes for highest badge
                          </p>
                        </div>
                        
                        {dashboardData.stats.quizQuestionsAnswered > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Quiz Accuracy</span>
                              </div>
                              <span className="text-sm font-bold">
                                {Math.round((dashboardData.stats.correctAnswers / dashboardData.stats.quizQuestionsAnswered) * 100)}%
                              </span>
                            </div>
                            <Progress value={(dashboardData.stats.correctAnswers / dashboardData.stats.quizQuestionsAnswered) * 100} />
                            <p className="text-xs text-muted-foreground text-right">
                              Goal: 80% accuracy on 10 quizzes for Quiz Master badge
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Learning Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Study Tips</CardTitle>
                      <CardDescription>Optimize your learning experience</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg border p-3">
                          <h4 className="font-semibold">Spaced Repetition</h4>
                          <p className="text-sm text-muted-foreground">
                            Review flashcards at increasing intervals to improve long-term retention.
                          </p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <h4 className="font-semibold">Active Recall</h4>
                          <p className="text-sm text-muted-foreground">
                            Test yourself with quizzes to strengthen memory pathways.
                          </p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <h4 className="font-semibold">Interleaved Practice</h4>
                          <p className="text-sm text-muted-foreground">
                            Mix different topics in study sessions rather than focusing on one subject.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Next Goals */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Next Goals</CardTitle>
                      <CardDescription>Achievements to work toward</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.stats.documentsUploaded < 10 && (
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-xl">🏆</span>
                            </div>
                            <div>
                              <p className="font-medium">Document Master</p>
                              <p className="text-xs text-muted-foreground">Upload {10 - dashboardData.stats.documentsUploaded} more documents</p>
                            </div>
                          </div>
                        )}
                        
                        {dashboardData.stats.flashcardsReviewed < 100 && (
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-xl">🏅</span>
                            </div>
                            <div>
                              <p className="font-medium">Flashcard Champion</p>
                              <p className="text-xs text-muted-foreground">Review {100 - dashboardData.stats.flashcardsReviewed} more flashcards</p>
                            </div>
                          </div>
                        )}
                        
                        {dashboardData.stats.quizzesCompleted < 10 && (
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-xl">🎓</span>
                            </div>
                            <div>
                              <p className="font-medium">Quiz Master</p>
                              <p className="text-xs text-muted-foreground">Complete {10 - dashboardData.stats.quizzesCompleted} more quizzes with 80% accuracy</p>
                            </div>
                          </div>
                        )}
                        
                        {dashboardData.stats.totalStudyTime < 600 && (
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-xl">🕰️</span>
                            </div>
                            <div>
                              <p className="font-medium">Study Legend</p>
                              <p className="text-xs text-muted-foreground">Study for {600 - dashboardData.stats.totalStudyTime} more minutes</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground max-w-md text-center">
                We couldn't load your dashboard data. Please try again later.
              </p>
            </div>
          )}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}