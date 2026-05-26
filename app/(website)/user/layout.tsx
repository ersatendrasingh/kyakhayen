import Container from "@/components/container";
import StickySidebar from "./_components/sticky-sidebar";

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#fbf7f0] py-6 dark:bg-[#091611] sm:py-8 lg:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(210,167,101,0.18),transparent_26%),radial-gradient(circle_at_94%_12%,rgba(190,58,40,0.10),transparent_24%)] dark:bg-[radial-gradient(circle_at_18%_6%,rgba(205,151,71,0.10),transparent_24%),radial-gradient(circle_at_90%_8%,rgba(190,58,40,0.14),transparent_25%)]" />
      <Container>
        <div className="relative mx-auto grid max-w-[1420px] gap-5 lg:grid-cols-[276px_minmax(0,1fr)] lg:gap-7">
          <StickySidebar />
          <main className="min-w-0">{children}</main>
        </div>
      </Container>
    </section>
  );
};

export default UserLayout;
