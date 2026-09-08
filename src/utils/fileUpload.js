
import { api } from "@/api/api";

export const getUploadUrl = (filePath) => {
  if (!filePath) return null;

  const normalizedPath = filePath.replace(/\\/g, "/");
  const uploadsIndex = normalizedPath.indexOf("/uploads/");

  return uploadsIndex >= 0
    ? `${api}${normalizedPath.slice(uploadsIndex)}`
    : filePath.startsWith("http")
      ? filePath
      : `${api}/${normalizedPath.replace(/^\/+/, "")}`;
};

export const getUploadName = (filePath) => {
  if (!filePath) return null;
  return filePath.replace(/\\/g, "/").split("/").pop();
};