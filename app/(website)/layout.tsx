import Footer from "@/components/footer/footer";
import { Header } from "@/components/header/header";
import MobileMenu from "@/components/header/mobile-menu";
import ScrollToTopButton from "@/components/scroll-to-top-button";

const WebsiteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MobileMenu />
      <main className="pt-[70px] h-full">{children}</main>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
};

export default WebsiteLayout;
