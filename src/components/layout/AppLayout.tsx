import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import FooterNav from "./FooterNav";
import DesktopFooter from "./DesktopFooter";
import SecondaryNav from "./SecondaryNav";
import CreatorStudioFAB from "@/components/video/CreatorStudioFAB";
import AIAssistantFAB from "@/components/ai/AIAssistantFAB";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  // Video pages should have full-screen experience
  const isVideoPage = location.pathname === "/videos";

  if (isVideoPage) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
        {/* Footer navigation for videos with special styling */}
        {isMobile && <FooterNav />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Secondary Navigation for user pages (desktop only) */}
      <SecondaryNav />
      {/* Add proper spacing for fixed header and ensure no horizontal overflow */}
      <main
        className={`w-full max-w-full overflow-x-hidden flex-1 ${
          isMobile ? "pt-14 pb-20 px-2" : "pt-20 pb-6 px-4"
        }`}
      >
        <div className="w-full max-w-full mx-auto">
          <div className={`${isMobile ? "py-2" : "py-4"}`}>
            <Outlet />
          </div>
        </div>
      </main>
      {/* Creator Studio Floating Action Button */}
      <CreatorStudioFAB />
      {/* AI Assistant Floating Action Button */}
      <AIAssistantFAB />
      {/* Desktop Footer */}
      {!isMobile && <DesktopFooter />}
      {/* Mobile Footer Navigation */}
      {isMobile && <FooterNav />}
    </div>
  );
};

export default AppLayout;
