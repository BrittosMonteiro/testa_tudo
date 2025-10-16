"use client";

import React from "react";

import useNetworkConnection from "@/hooks/useNetworkConnection";

export default function Header() {
  const isOnline = useNetworkConnection();

  return <div>{JSON.stringify(isOnline)}</div>;
}
