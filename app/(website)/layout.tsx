import Footer from "@/components/footer/footer";
import { Header } from "@/components/header/header";
import MobileMenu from "@/components/header/mobile-menu";
import ScrollToTopButton from "@/components/scroll-to-top-button";
import { ModeToggle } from "@/components/mode-toggle";

const WebsiteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MobileMenu />
      <div className="fixed bottom-7 left-7 z-40 hidden lg:block">
        <ModeToggle />
      </div>
      <main className="h-full pt-[108px] lg:pt-[100px]">{children}</main>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
};

export default WebsiteLayout;
