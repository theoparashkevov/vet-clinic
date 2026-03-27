import LoginPageClient from "../../components/LoginPageClient";

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const next = searchParams?.next || "/";
  return <LoginPageClient next={next} />;
}
