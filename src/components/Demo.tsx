import React, { FormEvent, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Metadata {
  title: string | null;
  authors: string[] | string | null;
}

interface ErrorResponse {
  error: string;
}

const Demo = () => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState<string | null>(null);
  const [authors, setAuthors] = useState<string | string[] | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTitle(null);
    setAuthors(null);
    setError("");

    try {
      const response = await fetch(
        `/api/metadata?url=${encodeURIComponent(url)}`
      );
      const data: Metadata | ErrorResponse = await response.json();

      if ("error" in data) {
        setError(data.error);
      } else {
        setTitle(data.title || "No title found");
        setAuthors(data.authors || "No authors found");
      }
    } catch (err) {
      setError("Failed to fetch metadata");
    }
  };

  return (
    <>
      <section className="mt-16 w-full max-w-xl">
        <div className="flex flex-col w-full gap-2">
          <form
            className="relative flex justify-center items-center"
            onSubmit={handleSubmit}
          >
            <Input
              className="block w-full rounded-md border border-gray-200 bg-white py-2.5 pl-10 pr-12 text-sm shadow-lg font-satoshi font-medium focus:border-black focus:outline-none focus:ring-0 peer"
              type="text"
              placeholder="Enter a URL"
              value={url}
              required
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              className="ml-2 peer-focus:border-gray-700 peer-focus:text-gray-700"
              type="submit"
            >
              Submit
            </Button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {title && (
            <p>
              <h2 className="font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent  text-gray-600 text-xl">
                Title:
              </h2>{" "}
              <p className="font-medium text-sm text-gray-700">{title}</p>
            </p>
          )}
          {authors && (
            <p>
              <h2 className="font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-gray-600 text-xl">
                Authors:
              </h2>{" "}
              <p className="font-medium text-sm text-gray-700">
                {Array.isArray(authors) ? authors.join(", ") : authors}
              </p>
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default Demo;
