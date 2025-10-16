"use client";

import { precacheDynamicRoutes } from "@/lib/offlineManager";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Exemplo: rotas recebidas do servidor
    const dynamicRoutes = ["/post/1", "/post/2", "/post/3"];

    // Envia para o Service Worker
    precacheDynamicRoutes(dynamicRoutes);
  }, []);
  return (
    <div>
      {[1, 2, 3].map((item) => (
        <Link key={item} href={`/post/${item}`}>
          Post {item}
        </Link>
      ))}
    </div>
  );
}
