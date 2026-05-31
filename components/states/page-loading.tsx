import Container from "@/components/container";
import { Skeleton } from "@/components/ui/skeleton";

export function WebsitePageLoading() {
  return (
    <div className="min-h-[calc(100svh-100px)] bg-[#fcf8f0] pb-14 dark:bg-[#091712]">
      <Container>
        <div className="py-7 sm:py-10">
          <div className="grid items-stretch gap-5 lg:grid-cols-[1.03fr_0.97fr]">
            <Skeleton className="min-h-[360px] rounded-[1.9rem] border border-[#eadcc8] bg-[#efe2cf] shadow-sm sm:min-h-[520px] lg:min-h-[590px] dark:border-white/8 dark:bg-[#10241e]" />
            <div className="rounded-[1.9rem] border border-[#eadcc8] bg-[#fffdf8] p-5 shadow-sm sm:p-8 dark:border-white/8 dark:bg-[#10241e]">
              <Skeleton className="h-4 w-44 bg-[#e9d5b7] dark:bg-white/10" />
              <Skeleton className="mt-7 h-12 w-[min(100%,540px)] bg-[#eee2d1] dark:bg-white/10 sm:h-16" />
              <Skeleton className="mt-3 h-12 w-[min(82%,450px)] bg-[#eee2d1] dark:bg-white/10" />
              <div className="mt-7 space-y-3">
                <Skeleton className="h-4 w-[min(100%,510px)] bg-[#eadfce] dark:bg-white/8" />
                <Skeleton className="h-4 w-[min(84%,420px)] bg-[#eadfce] dark:bg-white/8" />
                <Skeleton className="h-4 w-[min(70%,360px)] bg-[#eadfce] dark:bg-white/8" />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton
                    key={item}
                    className="h-20 rounded-2xl bg-[#f0e4d2] dark:bg-white/8"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              {[1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  className="h-36 rounded-[1.75rem] border border-[#eadcc8] bg-[#fffdf8] dark:border-white/8 dark:bg-[#10241e]"
                />
              ))}
            </div>
            <Skeleton className="hidden h-[420px] rounded-[1.75rem] border border-[#eadcc8] bg-[#fffdf8] lg:block dark:border-white/8 dark:bg-[#10241e]" />
          </div>
        </div>
      </Container>
    </div>
  );
}

export function AppPageLoading() {
  return (
    <div className="min-h-screen bg-[#fcf8f0] dark:bg-[#091712]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-10">
        <Skeleton className="h-12 w-48 rounded-full bg-[#ecddc6] dark:bg-white/10" />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <Skeleton className="h-[420px] rounded-[1.75rem] bg-[#ede0ca] dark:bg-[#10241e]" />
          <div className="space-y-4">
            <Skeleton className="h-16 rounded-2xl bg-[#ece0cf] dark:bg-white/10" />
            <Skeleton className="h-16 rounded-2xl bg-[#ece0cf] dark:bg-white/10" />
            <Skeleton className="h-16 rounded-2xl bg-[#ece0cf] dark:bg-white/10" />
            <Skeleton className="h-36 rounded-2xl bg-[#f0e5d8] dark:bg-white/8" />
          </div>
        </div>
      </div>
    </div>
  );
}
