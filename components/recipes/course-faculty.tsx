"use client";

import Image from "next/image";
import { useState } from "react";

const Coursefaculty = () => {
  const facultyList = [
    {
      id: 1,
      name: "Dr Shikha Nehru Sharma",
      position: "Ayurvedic Professor",
      department: "Doctoral Program in Ayurveda",
      description:
        "Dr Shikha Sharma, a TEDx speaker is a well-known name in the preventive healthcare sector is a medical doctor by training from Maulana Azad Medical College, New Delhi.  She had a weekly column for 11 years in The National Newspaper, HT BRUNCH. She is the Ex-Board member - Delhi University Colleges. She regularly appears on television and is quoted by leading newspapers. She has delivered lectures to the students of top engineering and management colleges like IIT Bombay, IIT Rookie, IIT Jodhpur, IIT Patna, NDIM, IMI Delhi, etc.",
      photoUrl:
        "https://unitus-lms.s3.ap-south-1.amazonaws.com/7e597f2a-6bda-4e21-a0fc-6820ebe6acb2/faculties/dr-shikha.jpg",
    },
    {
      id: 2,
      name: "Doctor of Nutriwel Health India Pvt. Ltd.",
      position: "Doctor",
      department: "Doctoral Program in Ayurveda",
      description:
        "Qualified and experienced BAMS Ayurveda Doctors with a rich experience of over 12 years in clinical practice. Experts in managing health conditions through natural plant based herbs and nutrition.",
      photoUrl:
        "https://unitus-lms.s3.ap-south-1.amazonaws.com/7e597f2a-6bda-4e21-a0fc-6820ebe6acb2/faculties/doctor.jpg",
    },
    {
      id: 3,
      name: "Nutritionist of Nutriwel Health India Pvt. Ltd.",
      position: "Nutritionist",
      department: "Nutritionist in Ayurveda",
      description:
        "Trainers are Post graduates in Food & Nutrition with a rich experience of over 10 years in clinical practice. Directly counseling the clients and delivering results for weight management and medical issues have helped them bring insights which are difficult to find in a single book.",
      photoUrl:
        "https://unitus-lms.s3.ap-south-1.amazonaws.com/7e597f2a-6bda-4e21-a0fc-6820ebe6acb2/faculties/nutrionist.jpg",
    },
  ];

  const [showAll, setShowAll] = useState(false);

  const toggleShowAll = () => {
    setShowAll((prevShowAll) => !prevShowAll);
  };

  return (
    <div className="w-full">
      <ul className="space-y-6">
        {facultyList
          .slice(0, showAll ? facultyList.length : 3)
          .map((faculty) => (
            <li
              key={faculty.id}
              className="bg-white rounded-lg shadow-md p-6 space-y-6 lg:flex lg:items-center lg:space-y-0 lg:space-x-6"
            >
              <div className="relative lg:w-1/3">
                <Image
                  src={faculty.photoUrl}
                  alt={faculty.name}
                  width={400}
                  height={400}
                  className="rounded-full mx-auto"
                />
              </div>
              <div className="flex flex-col lg:w-2/3">
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl text-emerald-500 font-bold">
                    {faculty.name}
                  </h3>
                  <p className="text-gray-600 text-lg font-bold mb-2">
                    {faculty.position}
                  </p>
                  <p className="text-gray-600 text-lg font-bold mb-3">
                    {faculty.department}
                  </p>
                </div>
                <p className="text-gray-600 text-md text-center lg:text-left">
                  {faculty.description}
                </p>
              </div>
            </li>
          ))}
      </ul>
      {facultyList.length > 3 && (
        <button
          onClick={toggleShowAll}
          className="text-blue-600 underline mt-4 block mx-auto px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors duration-300"
        >
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default Coursefaculty;
