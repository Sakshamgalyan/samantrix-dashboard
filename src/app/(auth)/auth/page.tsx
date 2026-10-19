import { AuthPage } from "@/features/auth";

const LoginPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; mode?: string; register?: string }>;
}) => {
  const params = await searchParams;
  const isRegister =
    params?.tab === "register" ||
    params?.tab === "register-org" ||
    params?.mode === "register" ||
    params?.mode === "register-org" ||
    params?.register !== undefined;

  return <AuthPage initialMode={isRegister ? "register-org" : "login"} />;
};

export default LoginPage;
