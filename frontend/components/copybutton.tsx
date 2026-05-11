import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value }: { value: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);

      // Revert back to the copy icon after 2 seconds
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center justify-center p-1 hover:bg-main hover:text-main-foreground rounded-md transition-all active:scale-95"
      title="Copy UUID"
    >
      {hasCopied
        ? (
          <Check className="h-4 w-4 animate-in hover:text-main-foreground zoom-in duration-200" />
        )
        : <Copy className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}
