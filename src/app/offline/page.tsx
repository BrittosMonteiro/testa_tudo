"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  const handleReload = () => {
    if (navigator.onLine) {
      router.push("/");
    } else {
      alert("Ainda sem conexão com a internet 😕");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#1E283B] text-white p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold mb-4">Você está offline</h1>
        <p className="text-gray-300 mb-8">
          Parece que sua conexão com a internet foi perdida.
          <br />
          Algumas páginas podem não estar disponíveis no momento.
        </p>

        <button
          onClick={handleReload}
          className="bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-3 rounded-xl font-semibold"
        >
          {isOnline ? "Voltar para o início" : "Tentar novamente"}
        </button>
      </div>

      <footer className="mt-10 text-sm text-gray-400">
        Modo offline ativado – suas páginas salvas ainda estão acessíveis.
      </footer>
    </main>
  );
}
