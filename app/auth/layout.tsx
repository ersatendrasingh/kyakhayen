"use client";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full overflow-auto flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500">
      {children}
    </div>
  );
};

export default AuthLayout;
