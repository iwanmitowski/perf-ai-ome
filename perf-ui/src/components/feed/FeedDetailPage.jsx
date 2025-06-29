import React from "react";
import { Route as FeedDetailRoute } from "@/routes/feed/$id";
import ReactMarkdown from "react-markdown";

export default function FeedDetailPage() {
  const item = FeedDetailRoute.useLoaderData();

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-4xl font-bold mb-4">{item.title}</h1>
      <img
        src={item.imageUrl}
        alt={item.title}
        className="aspect-[16/10] w-full object-cover mb-6"
      />
      <ReactMarkdown>{item.content}</ReactMarkdown>
    </div>
  );
}
