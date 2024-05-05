import Image from "next/image";
import Link from "next/link";

interface RecipeSidebarWidgetProps {
  title: string;
  type: string | "category";
  widgetItems?: {
    id: string;
    name?: string;
    title?: string;
    slug: string;
    imageUrl: string | null;
  }[];
}

const RecipeSidebarWidget = ({
  title,
  type,
  widgetItems,
}: RecipeSidebarWidgetProps) => {
  return (
    <div className="bg-white p-4 right-0 border-2 rounded-md transition shadow-md mb-6">
      <h3 className="text-lg text-websecondary font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {widgetItems &&
          widgetItems.map((widget) => (
            <Link
              key={widget.id}
              href={`/recipes?k=${widget.slug}&type=${type}`}
              className="rounded-full p-2  text-gray-700 text-center hover:text-websecondary hover:border-300 transition duration-300 text-sm font-semibold"
            >
              <div className="flex flex-col items-center justify-center">
                <Image
                  src={widget.imageUrl || "/assets/images/default-category.jpg"}
                  alt={widget.name || widget.title || "Category Image"}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <span>{widget.name || widget.title}</span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default RecipeSidebarWidget;
