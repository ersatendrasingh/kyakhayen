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
        <AccordionTrigger>How can I contact support?</AccordionTrigger>
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
        <AccordionTrigger>When can I expect a response?</AccordionTrigger>
        <AccordionContent>
          We typically respond to inquiries within 24 hours during weekdays.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is there a phone number I can call?</AccordionTrigger>
        <AccordionContent>
          At this time, we only provide support via email and the contact form.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>How do I find specific recipes?</AccordionTrigger>
        <AccordionContent>
          You can use the search bar on our homepage to find specific recipes.
          Simply enter the name of the dish or ingredients you have, and
          we&apos;ll show you a list of matching recipes.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger>Can I save my favorite recipes?</AccordionTrigger>
        <AccordionContent>
          Yes, you can save your favorite recipes by creating an account and
          adding them to your favorites. This way, you can easily access them
          anytime.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-6">
        <AccordionTrigger>How do I create a meal plan?</AccordionTrigger>
        <AccordionContent>
          To create a meal plan, navigate to the &quot;Meal Plan&quot; section
          on our website or app. You can select your preferred recipes and
          schedule them for different days of the week. Our platform also allows
          you to customize your meal plan based on your dietary preferences and
          health goals.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
