/**
 * Login Page
 */

import { FormLogin } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paham<span className="text-blue-600">Kode</span>
          </h1>
          <p className="text-gray-600">Analisis Error dengan AI</p>
        </div>
        <FormLogin />
      </div>
    </div>
  );
}
