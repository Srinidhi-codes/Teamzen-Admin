import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the Teamzen HRMS administrator console to manage workforce, attendance, leaves, and payroll.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
