import { useEffect } from "react";
import { useLocation } from "wouter";
import TabNavigation from "@/components/TabNavigation";
import UploadTab from "@/components/UploadTab";

export default function Home() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to upload page as the default view
    setLocation("/upload");
  }, [setLocation]);

  return null;
}
