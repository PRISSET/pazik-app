import AuthForm from '../components/AuthForm';

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-3xl font-bold mb-8 accent-glow">Пацики Гасимся</h1>
      <AuthForm />
    </div>
  );
} 