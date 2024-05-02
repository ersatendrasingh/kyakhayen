"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Preview } from "@/components/preview";

interface Faq {
  id: string;
  title: string;
  description: string | null;
  position: number;
  isPublished: boolean;
  createdAt: Date;
}

interface CourseFaqsProps {
  faqs: Faq[];
}

const CourseFaqs = ({ faqs }: CourseFaqsProps) => {
  const firstFaqId = faqs.length > 0 ? faqs[0].id : null;

  const [showAll, setShowAll] = useState(false);

  const toggleShowAll = () => {
    setShowAll((prevShowAll) => !prevShowAll);
  };

  const visibleFaqs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <div className="w-full">
      {faqs.length < 1 && (
        <p className="text-lg font-bold text-center">No FAQs available</p>
      )}
      <Accordion
        type="single"
        defaultValue={firstFaqId || ""}
        collapsible
        className="w-full"
      >
        {visibleFaqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <div className="w-full">
              <AccordionTrigger className="flex items-center justify-between w-full bg-sky-100 hover:bg-sky-200 border px-4 py-4  border-sky-200 hover:no-underline">
                <div className="flex items-center justify-between gap-3 md:gap-0 w-full ">
                  <p className="text-lg font-bold w-full text-start">
                    {faq.title}
                  </p>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="border border-t-0 mt-0 border-sky-200">
              <Preview value={faq.description || "No description available"} />
            </AccordionContent>
          </AccordionItem>
        ))}
        {faqs.length > 5 && (
          <button
            onClick={toggleShowAll}
            className="text-white mt-4 block mx-auto px-4 py-2 rounded-md bg-emerald-600 hover:bg-sky-500 transition-colors duration-300"
          >
            {showAll ? "Show Less" : "Show More"}
          </button>
        )}
      </Accordion>
    </div>
  );
};

export default CourseFaqs;
