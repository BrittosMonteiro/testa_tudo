export default function OfflinePage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center p-6">
      <h1 className="text-2xl font-bold mb-4">Você está offline</h1>
      <p className="text-gray-500 mb-6">
        Esta página não está disponível sem conexão.
      </p>
      <button
        type="button"
        onClick={() => (window.location.href = "/")}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Voltar para a página inicial
      </button>
    </main>
  );
}
