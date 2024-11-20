import { redirect } from "next/navigation";

const AdminPage = async () => {
  return redirect("/admin/dashboard");
};

export default AdminPage;
