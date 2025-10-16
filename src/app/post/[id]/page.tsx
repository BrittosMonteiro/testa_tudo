import React from "react";

interface PageProps {
  params: { id_page: string };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id_page: PageProps["params"]["id_page"] }>;
}) {
  const { id_page } = await params;
  return <div>{id_page}</div>;
}
