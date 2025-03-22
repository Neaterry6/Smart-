import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface PaymentTabProps {
  onPaymentComplete?: () => void;
}

export default function PaymentTab({ onPaymentComplete }: PaymentTabProps) {
  const [copied, setCopied] = useState(false);
  const [, navigate] = useLocation();

  // OPay account details
  const accountDetails = {
    accountName: "Akewushola Abdulbakri Temitope",
    accountNumber: "9019185241",
    bank: "OPay"
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Success",
        description: "Account number copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    toast({
      title: "Free Access Granted",
      description: "You can now use all features of the application",
    });
    if (onPaymentComplete) {
      onPaymentComplete();
    }
    navigate("/upload");
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Pricing Plans
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Choose the right plan for your study needs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="border-2 border-primary shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Basic</CardTitle>
              <Badge variant="outline" className="text-sm font-medium">Free for Now</Badge>
            </div>
            <CardDescription>Perfect for occasional studying</CardDescription>
            <div className="mt-4">
              <span className="text-5xl font-extrabold">₦0</span>
              <span className="text-sm font-medium text-gray-500 ml-2">/ month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>5 Document uploads per month</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Basic flashcards</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Simple quizzes</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Basic summaries</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSkip}>
              Start for Free
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Premium</CardTitle>
              <Badge variant="secondary" className="text-sm font-medium">Popular</Badge>
            </div>
            <CardDescription>For serious students</CardDescription>
            <div className="mt-4">
              <span className="text-5xl font-extrabold">₦2,000</span>
              <span className="text-sm font-medium text-gray-500 ml-2">/ month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Unlimited document uploads</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Advanced flashcards with images</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Customizable quizzes</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>In-depth summaries with key concepts</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Priority processing</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg w-full">
              <h3 className="font-medium text-sm mb-2">Make payment to:</h3>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm">Bank:</div>
                <div className="font-medium">{accountDetails.bank}</div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm">Account Name:</div>
                <div className="font-medium">{accountDetails.accountName}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">Account Number:</div>
                <div className="font-medium flex items-center">
                  {accountDetails.accountNumber}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 h-8 w-8 p-0"
                    onClick={() => copyToClipboard(accountDetails.accountNumber)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={handleSkip}>
              Continue (Coming Soon)
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-500">
          All plans include access to our AI-powered document processing system.
          <br />
          Have questions? Contact our support.
        </p>
      </div>
    </div>
  );
}