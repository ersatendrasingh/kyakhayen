import Container from "@/components/container";
import { Skeleton } from "@/components/ui/skeleton";

export function WebsitePageLoading() {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-[#fcf8f0] pb-14 dark:bg-[#091712]">
      <Container>
        <div className="grid gap-8 py-10 lg:grid-cols-[1fr_0.94fr] lg:items-center lg:py-16">
          <div>
            <Skeleton className="h-4 w-44 bg-[#e9d5b7] dark:bg-white/10" />
            <Skeleton className="mt-7 h-12 w-[min(100%,540px)] bg-[#eee2d1] dark:bg-white/10 sm:h-16" />
            <Skeleton className="mt-3 h-12 w-[min(82%,450px)] bg-[#eee2d1] dark:bg-white/10" />
            <div className="mt-7 space-y-3">
              <Skeleton className="h-4 w-[min(100%,510px)] bg-[#eadfce] dark:bg-white/8" />
              <Skeleton className="h-4 w-[min(84%,420px)] bg-[#eadfce] dark:bg-white/8" />
            </div>
            <Skeleton className="mt-8 h-11 w-48 rounded-full bg-[#e9d5b7] dark:bg-white/10" />
          </div>
          <Skeleton className="h-[300px] rounded-[1.8rem] bg-[#ebdfcc] dark:bg-[#10241e] sm:h-[390px]" />
        </div>
        <Skeleton className="mb-8 h-28 rounded-[1.5rem] bg-[#f0e4d2] dark:bg-[#10241e]" />
        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-[1.45rem] border border-[#eadcc8] bg-[#fffaf2] p-6 dark:border-white/8 dark:bg-[#10241e]"
            >
              <Skeleton className="size-11 rounded-xl bg-[#eadbc4] dark:bg-white/10" />
              <Skeleton className="mt-6 h-5 w-36 bg-[#eadfce] dark:bg-white/10" />
              <Skeleton className="mt-4 h-3.5 w-full bg-[#eee4d6] dark:bg-white/8" />
              <Skeleton className="mt-2 h-3.5 w-4/5 bg-[#eee4d6] dark:bg-white/8" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export function AppPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_15%_12%,#f6e4c6,transparent_30%),radial-gradient(circle_at_88%_18%,#f3dace,transparent_30%),#fcf8f0] p-5 dark:bg-[radial-gradient(circle_at_15%_12%,rgba(205,151,71,0.12),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(190,58,40,0.13),transparent_30%),#091712]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#eadcc8] bg-[#fffdf9] shadow-[0_28px_80px_rgba(59,43,31,0.09)] lg:grid-cols-[0.9fr_1.1fr] dark:border-white/8 dark:bg-[#10241e]">
        <div className="space-y-6 p-8 sm:p-12">
          <Skeleton className="h-12 w-48 rounded-full bg-[#ecddc6] dark:bg-white/10" />
          <Skeleton className="h-11 w-full bg-[#ece0cf] dark:bg-white/10" />
          <Skeleton className="h-11 w-4/5 bg-[#ece0cf] dark:bg-white/10" />
          <Skeleton className="h-4 w-full bg-[#f0e5d8] dark:bg-white/8" />
          <Skeleton className="h-4 w-3/4 bg-[#f0e5d8] dark:bg-white/8" />
          <Skeleton className="h-12 w-full rounded-full bg-[#e7d3b3] dark:bg-white/10" />
        </div>
        <Skeleton className="min-h-[320px] rounded-none bg-[#ede0ca] dark:bg-[#162e27] lg:min-h-[540px]" />
      </div>
    </div>
  );
}
