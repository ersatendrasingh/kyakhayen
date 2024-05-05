import Image from "next/image";
import Link from "next/link";
import Container from "../container";

interface HomeCategoryProps {
  title: string;
  widgetItems?: {
    id: string;
    name?: string;
    title?: string;
    slug: string;
    imageUrl: string | null;
  }[];
}

const HomeCategory = ({ title, widgetItems }: HomeCategoryProps) => {
  return (
    <div className="w-full flex items-center justify-center pt-6 pb-10 ">
      <Container>
        <h3 className="text-3xl font-bold text-center text-websecondary mb-10">
          {title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {widgetItems &&
            widgetItems.map((widget) => (
              <Link
                key={widget.id}
                href={`/recipes?k=${widget.slug}&type=category`}
                className="rounded-full p-2  text-gray-700 text-center hover:text-websecondary hover:border-300 transition duration-300 text-sm font-semibold relative"
              >
                <div className="relative overflow-hidden group">
                  <Image
                    src={
                      widget.imageUrl || "/assets/images/default-category.jpg"
                    }
                    alt={widget.name || widget.title || "Category Image"}
                    width={180}
                    height={180}
                    className="rounded-full transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <span className="absolute inset-0 bg-black opacity-40 rounded-full transition-opacity duration-300"></span>
                  <span className="absolute inset-0  flex items-center justify-center text-white  py-2 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-1">
                    {widget.name || widget.title}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </Container>
    </div>
  );
};

export default HomeCategory;
