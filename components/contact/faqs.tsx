import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-websecondary">
          How can I contact support?
        </AccordionTrigger>
        <AccordionContent>
          You can reach our support team via email at{" "}
          <a
            href="mailto:mailtokyakhayen@gmail.com"
            className="text-red-700 hover:underline"
          >
            mailtokyakhayen@gmail.com
          </a>{" "}
          or through the contact form on this page.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="text-websecondary">
          When can I expect a response?
        </AccordionTrigger>
        <AccordionContent>
          We typically respond to enquiries within 24 hours during weekdays.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="text-websecondary">
          Is there a phone number I can call?
        </AccordionTrigger>
        <AccordionContent>
          At this time, we only provide support via email and the contact form.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger className="text-websecondary">
          How do I find specific recipes?
        </AccordionTrigger>
        <AccordionContent>
          You can use the search bar on any page of our website to find specific
          recipes. Simply enter the name of the recipe or ingredients you have,
          and we&apos;ll show you a list of all matching records.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger className="text-websecondary">
          Can I save my favorite recipes?
        </AccordionTrigger>
        <AccordionContent>
          Yes, you can save your favorite recipes by creating an account and
          adding them to your favorites. This way, you can easily access them
          anytime you&apos;re logged in.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-6">
        <AccordionTrigger className="text-websecondary">
          How do I create a meal plan?
        </AccordionTrigger>
        <AccordionContent>
          To create a meal plan, you can create an account and buy a
          subscription plan. After that, you need to complete your
          personalization. Once you have an active subscription and
          personalization done, you can access the personalized meal plan from
          the meal plan page.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
