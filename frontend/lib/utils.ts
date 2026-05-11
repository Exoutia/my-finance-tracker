import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(value) {
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    // You should probably trigger a toast notification here
    console.log("UUID copied to clipboard");
  } catch (err) {
    console.error("Failed to copy!", err);
  }
}
