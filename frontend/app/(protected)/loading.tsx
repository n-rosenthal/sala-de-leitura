// app/(protected)/loading.tsx
export default function ProtectedLoading() {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg animate-pulse">Verificando acesso…</p>
      </div>
    );
  }
  