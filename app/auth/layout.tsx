"use client";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full overflow-auto flex items-center justify-center bg-webprimary">
      {children}
    </div>
  );
};

export default AuthLayout;
