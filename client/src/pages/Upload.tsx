import TabNavigation from "@/components/TabNavigation";
import UploadTab from "@/components/UploadTab";

export default function Upload() {
  return (
    <>
      <TabNavigation activeTab="upload" />
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <UploadTab />
      </div>
    </>
  );
}
