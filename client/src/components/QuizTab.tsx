import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Quiz, Document, QuizQuestion } from "@shared/schema";
import { Check, X, ChevronLeft, ChevronRight, AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizTabProps {
  documentId: number;
}

export default function QuizTab({ documentId }: QuizTabProps) {
  const { toast } = useToast();
  const [quizType, setQuizType] = useState("multiple-choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState("10");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | number | null)[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  const { data: document } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
  });
  
  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuery<Quiz[]>({
    queryKey: [`/api/documents/${documentId}/quizzes`],
  });
  
  const { data: documents } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  const generateQuizMutation = useMutation({
    mutationFn: async (params: { type: string; difficulty: string; numQuestions: string; }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/quizzes`, {
        type: params.type,
        difficulty: params.difficulty,
        numQuestions: parseInt(params.numQuestions),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setActiveQuiz(data);
      setQuizStarted(true);
      setUserAnswers(new Array(data.questions.length).fill(null));
    },
    onError: (error) => {
      toast({
        title: "Failed to generate quiz",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });
  
  const handleDocumentChange = (newDocId: string) => {
    // Redirect to the new document's quizzes
    window.location.href = `/quiz/${newDocId}`;
  };
  
  const startQuiz = () => {
    // Find an existing quiz that matches the criteria
    if (quizzes && quizzes.length > 0) {
      const matchingQuiz = quizzes.find(
        quiz => quiz.type === quizType && quiz.difficulty === difficulty
      ) || quizzes[0];
      
      setActiveQuiz(matchingQuiz);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setUserAnswers(new Array(matchingQuiz.questions.length).fill(null));
      setQuizCompleted(false);
    } else {
      // Generate a new quiz
      generateQuizMutation.mutate({ type: quizType, difficulty, numQuestions });
    }
  };
  
  const handleAnswerSelection = (answer: string | number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };
  
  const nextQuestion = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (activeQuiz) {
      // Quiz is complete
      setQuizCompleted(true);
      
      // Calculate score
      let correctAnswers = 0;
      userAnswers.forEach((answer, index) => {
        if (answer === activeQuiz.questions[index].correctAnswer) {
          correctAnswers++;
        }
      });
      
      const totalQuestions = activeQuiz.questions.length;
      const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
      setScore(calculatedScore);
      
      toast({
        title: "Quiz completed!",
        description: `Your score: ${calculatedScore}% (${correctAnswers}/${totalQuestions} correct)`,
      });
    }
  };
  
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setActiveQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
  };
  
  if (isLoadingQuizzes) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading quizzes...</p>
      </div>
    );
  }
  
  // Quiz setup screen
  if (!quizStarted) {
    return (
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Test Your Knowledge</h2>
          <p className="text-gray-600">Take a quiz to evaluate your understanding</p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Settings</h3>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="quiz-document" className="block text-sm font-medium text-gray-700">Document</label>
                <Select value={documentId.toString()} onValueChange={handleDocumentChange}>
                  <SelectTrigger id="quiz-document" className="mt-1">
                    <SelectValue placeholder="Select a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents?.filter(doc => doc.processingStatus === "completed").map(doc => (
                      <SelectItem key={doc.id} value={doc.id.toString()}>
                        {doc.originalName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="quiz-type" className="block text-sm font-medium text-gray-700">Quiz Type</label>
                <Select value={quizType} onValueChange={setQuizType}>
                  <SelectTrigger id="quiz-type" className="mt-1">
                    <SelectValue placeholder="Select a quiz type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="quiz-difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="quiz-difficulty" className="mt-1">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="quiz-questions" className="block text-sm font-medium text-gray-700">Number of Questions</label>
                <Select value={numQuestions} onValueChange={setNumQuestions}>
                  <SelectTrigger id="quiz-questions" className="mt-1">
                    <SelectValue placeholder="Select number of questions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full" 
                onClick={startQuiz}
                disabled={generateQuizMutation.isPending}
              >
                {generateQuizMutation.isPending ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></span>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <AlarmClock className="h-4 w-4 mr-2" />
                    Start Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Quiz results
  if (quizCompleted && activeQuiz) {
    return (
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quiz Results</h2>
          <p className="text-gray-600">See how well you understand the material</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-center text-xl">
                Your Score: {score}%
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {activeQuiz.questions.map((question, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {userAnswers[index] === question.correctAnswer ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{question.question}</p>
                        {question.options && (
                          <ul className="mt-2 space-y-1">
                            {question.options.map((option, optionIndex) => (
                              <li 
                                key={optionIndex} 
                                className={`text-sm ${
                                  optionIndex === question.correctAnswer 
                                    ? 'text-green-700 font-medium' 
                                    : userAnswers[index] === optionIndex 
                                      ? 'text-red-700 line-through' 
                                      : 'text-gray-700'
                                }`}
                              >
                                {option}
                                {optionIndex === question.correctAnswer && " ✓"}
                              </li>
                            ))}
                          </ul>
                        )}
                        {question.explanation && (
                          <p className="mt-2 text-sm text-gray-600">{question.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex justify-center">
              <Button onClick={resetQuiz}>
                Take Another Quiz
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  // Active quiz question
  const currentQuestion = activeQuiz?.questions[currentQuestionIndex] as QuizQuestion;
  
  if (!currentQuestion) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No questions available</p>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {document?.originalName} Quiz
            </h3>
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {activeQuiz?.questions.length}
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">{currentQuestion.question}</h4>
          
          <div className="space-y-3">
            {currentQuestion.options ? (
              <RadioGroup 
                value={userAnswers[currentQuestionIndex]?.toString() || ""}
                onValueChange={(value) => handleAnswerSelection(parseInt(value))}
              >
                {currentQuestion.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={optionIndex.toString()} id={`option-${optionIndex}`} />
                    <Label htmlFor={`option-${optionIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <RadioGroup 
                value={userAnswers[currentQuestionIndex]?.toString() || ""}
                onValueChange={(value) => handleAnswerSelection(value === "true")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="option-true" />
                  <Label htmlFor="option-true">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="option-false" />
                  <Label htmlFor="option-false">False</Label>
                </div>
              </RadioGroup>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-between">
          <Button 
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button 
            onClick={nextQuestion}
            disabled={userAnswers[currentQuestionIndex] === null}
          >
            {currentQuestionIndex === (activeQuiz?.questions.length || 0) - 1 ? (
              "Finish Quiz"
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
