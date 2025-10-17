"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl font-semibold mb-4">Você está offline</h1>
      <p className="mb-6 text-gray-300">
        Não foi possível carregar esta página.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
}
