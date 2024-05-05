import React, { useState } from "react";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const changeTab = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div>
      <nav className="flex">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${
              activeTab === index
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } py-4 px-6 inline-flex items-center border-b-2 font-bold text-sm focus:outline-none`}
            onClick={() => changeTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="mt-2">{tabs[activeTab].content}</div>
    </div>
  );
};

export default Tabs;
