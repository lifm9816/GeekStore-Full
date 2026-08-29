import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GeekStore | Página no encontrada",
};

export default function RootNotFound() {
  return (
    <html lang="es">
      <body className="bg-[#19222D] text-white">
        <main className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-6xl font-extrabold text-[#7A94AD]">404</p>
          <h1 className="mt-4 text-xl font-bold">Página no encontrada</h1>
        </main>
      </body>
    </html>
  );
}
