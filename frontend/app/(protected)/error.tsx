"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-red-600">
        Algo deu errado
      </h2>

      <p className="mt-2 text-gray-600">
        {error.message}
      </p>

      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Tentar novamente
      </button>
    </div>
  );
}
