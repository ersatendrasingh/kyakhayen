"use client";

import Container from "@/components/container";

const Copyrights = () => {
  return (
    <div className="mt-4 py-3 mb-14 md:mb-0 flex justify-center items-center bg-gray-300 font-bold">
      <Container>
        <p>
          &copy; {new Date().getFullYear()} Unitus Health Academy. All rights
          reserved.
        </p>
      </Container>
    </div>
  );
};

export default Copyrights;
