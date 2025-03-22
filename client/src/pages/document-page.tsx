import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizTab } from "@/components/QuizTab";
import { ChatTab } from "@/components/ChatTab";

function Document({ documentId }: { documentId: string }) {
  return (
    <Tabs defaultValue="quiz" className="space-y-4">
      <TabsList>
        <TabsTrigger value="quiz">Quiz</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
      </TabsList>
      <TabsContent value="quiz" className="flex-1">
        <QuizTab documentId={documentId} />
      </TabsContent>
      <TabsContent value="chat" className="flex-1">
        <ChatTab />
      </TabsContent>
    </Tabs>
  );
}

export default Document;