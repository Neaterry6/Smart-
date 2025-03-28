import { ChatTab } from "@/components/ChatTab";

export default function Chat() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Study Assistant</h1>
      <p className="text-gray-600 mb-6">
        Chat with your AI assistant about any topic. Ask questions about your study material,
        get explanations for difficult concepts, or request study tips.
      </p>
      
      <div className="bg-white rounded-lg shadow-md p-6 min-h-[60vh]">
        <ChatTab />
      </div>
    </div>
  );
}