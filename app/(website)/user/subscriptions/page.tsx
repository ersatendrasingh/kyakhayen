import Link from "next/link";
import { ArrowRight, Gift, Mail, Sparkles } from "lucide-react";
import { currentUser } from "@/lib/auth";
import SubscriptionCard from "../_components/subscription-card";
import AccountPageHeading from "../_components/account-page-heading";

const UserSubscriptionPage = async () => {
  const user = await currentUser();
  if (!user) return null;
  const hasPlan = Boolean(user.userPlan?.length);

  return (
    <div>
      <AccountPageHeading
        eyebrow="Launch access"
        title="Everything is open during launch"
        description="Personalized meal plans are available free right now, including future downloadable and email-ready plan experiences as they arrive."
      />

      <section className="relative mb-5 overflow-hidden rounded-[1.8rem] bg-[#32241b] p-6 text-white dark:bg-[#142820] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(221,173,91,0.33),transparent_34%),linear-gradient(100deg,rgba(190,52,39,0.32),transparent_46%)]" />
        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#f1d5a2]">
              <Gift className="size-3.5" /> Free during launch
            </span>
            <h2 className="text-2xl font-semibold sm:text-3xl">Your weekly table, without a paywall.</h2>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Generate, revisit and refine a meal plan with your everyday food choices while launch access is active.
            </p>
          </div>
          <Link href="/meal-plan/create" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#bf3a2b] px-5 py-3 text-sm font-semibold text-white">
            Create a plan <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {hasPlan ? (
        <SubscriptionCard
          subscription={user.userPlan![0]}
          planStartDate={user.userPlanStartDate[0]}
          planEndDate={user.userPlanEndDate[0]}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <AccessItem icon={Sparkles} title="Personalized weekly plan" text="Food style, cuisines, exclusions and cooking comfort shape your week." />
          <AccessItem icon={Mail} title="Plan sharing ahead" text="PDF and email delivery will fit into the same launch access experience." />
        </div>
      )}
    </div>
  );
};

const AccessItem = ({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) => (
  <div className="rounded-[1.6rem] border border-[#eadcc9] bg-[#fffdf8] p-6 dark:border-white/10 dark:bg-[#10231c]">
    <Icon className="mb-5 size-6 text-[#bd382a] dark:text-[#dfb472]" />
    <h2 className="font-semibold text-[#33251d] dark:text-[#f1ece5]">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-[#78675c] dark:text-[#a9b9b0]">{text}</p>
  </div>
);

export default UserSubscriptionPage;
