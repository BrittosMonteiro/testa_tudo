"use client";

import { precacheDynamicRoutes } from "@/lib/offlineManager";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const dynamicRoutes = ["/post/1", "/post/2", "/post/3"];

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
