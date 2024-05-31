import Demo from "@/components/Demo";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";

interface Metadata {
  title: string | null;
  authors: string[] | string | null;
}

interface ErrorResponse {
  error: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState<string | null>(null);
  const [authors, setAuthors] = useState<string | string[] | null>(null);
  const [error, setError] = useState("");

  return (
    <main>
      <div className="w-screen min-h-screen fixed flex justify-center pt-28 pb-40 px-6 pointer-events-none">
        {/* <div className="gradient" /> */}
      </div>

      <div className="relative z-10 flex justify-center items-center flex-col max-w-7xl mx-auto sm:px-16 px-6">
        <Hero />
        <Demo />
      </div>

      {/* <div className="relative z-10 flex justify-center items-center flex-col max-w-7xl mx-auto sm:px-16 px-6">
         <h1>Metadata Retrieval</h1> 
         <Hero />
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter PDF URL"
          />
          <Button type="submit">Get Metadata</Button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {title && (
          <p>
            <strong>Title:</strong> {title}
          </p>
        )}
        {authors && (
          <p>
            <strong>Authors:</strong>{" "}
            {Array.isArray(authors) ? authors.join(", ") : authors}
          </p>
        )} 
      </div> */}
    </main>
  );
}
