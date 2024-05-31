import type { NextApiRequest, NextApiResponse } from "next";
import pdf from "pdf-parse";
import fetch from "node-fetch";

interface Metadata {
  title: string | null;
  authors: string[] | string | null;
}

interface ErrorResponse {
  error: string;
}

// Type definitions for DOI API response
interface DOIValue {
  type: string;
  data: { value: string };
}

interface DOIResponse {
  responseCode: number;
  values: DOIValue[];
}

// Type definitions for OpenLibrary API response
interface OpenLibraryBook {
  title: string;
  authors: { name: string }[];
}

interface OpenLibraryResponse {
  [key: string]: OpenLibraryBook;
}

// Fetch DOI Metadata
const fetchDOIMetadata = async (doi: string): Promise<Metadata> => {
  const url = `https://doi.org/api/handles/${doi}`;
  const response = await fetch(url);
  const data: DOIResponse = (await response.json()) as DOIResponse;

  if (data.responseCode === 1) {
    const title =
      data.values.find((v) => v.type === "HS_TITLE")?.data.value || null;
    const authors =
      data.values.find((v) => v.type === "HS_CREATOR")?.data.value || null;
    return { title, authors };
  }

  throw new Error("DOI not found");
};

// Fetch arXiv Metadata
const fetchArXivMetadata = async (arxivId: string): Promise<Metadata> => {
  const url = `http://export.arxiv.org/api/query?id_list=${arxivId}`;
  const response = await fetch(url);
  const text = await response.text();
  const { DOMParser } = require("xmldom");
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");
  const entry = xml.getElementsByTagName("entry")[0];
  const title = entry.getElementsByTagName("title")[0]?.textContent || null;
  const authors =
    Array.from(entry.getElementsByTagName("author")).map((author) => {
      const nameNode = author.getElementsByTagName("name")[0];
      return nameNode ? nameNode.textContent || null : null;
    }) || null;
  return { title, authors };
};

// Fetch ISBN Metadata
const fetchISBNMetadata = async (isbn: string): Promise<Metadata> => {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  const response = await fetch(url);
  const data: OpenLibraryResponse =
    (await response.json()) as OpenLibraryResponse;
  const book = data[`ISBN:${isbn}`];

  if (book) {
    const title = book.title || null;
    const authors = book.authors.map((author) => author.name) || null;
    return { title, authors };
  }

  throw new Error("ISBN not found");
};

// Fetch metadata directly from PDF file
const fetchPdfMetadata = async (pdfUrl: string): Promise<Metadata> => {
  const response = await fetch(pdfUrl);
  const pdfBuffer = await response.buffer();
  const pdfData = await pdf(pdfBuffer);

  // Extract title and authors from pdfData
  const title = pdfData.info?.Title || null;
  let authors: string[] | null = null;

  // Try to extract authors from various possible fields
  if (pdfData.info?.Author) {
    authors = pdfData.info.Author.split(",");
  } else if (pdfData.metadata?.dc?.creator) {
    authors = pdfData.metadata.dc.creator;
  } else if (pdfData.metadata?.author) {
    authors = pdfData.metadata.author;
  } else if (pdfData.metadata?.["dc:creator"]) {
    authors = pdfData.metadata["dc:creator"];
  }

  // Trim whitespace from each author
  if (authors) {
    authors = authors.map((author) => author.trim());
  }

  return { title, authors };
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Metadata | ErrorResponse>
) => {
  const { url } = req.query;

  if (typeof url !== "string") {
    return res.status(400).json({ error: "Invalid URL parameter" });
  }

  try {
    let metadata: Metadata;

    if (url.includes("doi.org")) {
      const doi = url.split("/").pop();
      if (doi) {
        metadata = await fetchDOIMetadata(doi);
      } else {
        throw new Error("Invalid DOI URL");
      }
    } else if (url.includes("arxiv.org")) {
      const arxivId = url.split("/").pop()?.replace(".pdf", "");
      if (arxivId) {
        metadata = await fetchArXivMetadata(arxivId);
      } else {
        throw new Error("Invalid arXiv URL");
      }
    } else if (url.includes("ISBN:")) {
      const isbn = url.split(":").pop();
      if (isbn) {
        metadata = await fetchISBNMetadata(isbn);
      } else {
        throw new Error("Invalid ISBN URL");
      }
    } else if (url.startsWith("https://storage.googleapis.com")) {
      metadata = await fetchPdfMetadata(url);
    } else {
      throw new Error("Unsupported URL format");
    }

    res.status(200).json(metadata);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
