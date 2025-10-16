"use client";

import React from "react";

import useNetworkConnection from "@/hooks/useNetworkConnection";
import Link from "next/link";

export default function Header() {
  const isOnline = useNetworkConnection();

  return (
    <header>
      <nav className="flex gap-4">
        <Link href={"/"}>Home</Link>
        <Link href={"/sobre"}>Sobre</Link>
        <Link href={"/contato"}>Contato</Link>
      </nav>
      <span>Estou online: {isOnline ? "sim" : "não"}</span>
    </header>
  );
}
