import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-4">Not Found</h2>
      <p className="text-lg text-gray-600 mb-8">
        Could not find the requested resource
      </p>
      <Link href="/">
        <a className="text-blue-600 hover:underline">Return Home</a>
      </Link>
    </div>
  );
};

export default NotFound;
