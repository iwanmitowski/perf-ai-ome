import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function Loader({ className, ...props }) {
  return (
    <Loader2
      data-slot="loader"
      className={cn("animate-spin", className)}
      {...props}
    />
  );
}

function PageLoader({ className, ...props }) {
  return (
    <div
      data-slot="page-loader"
      className={cn("grid min-h-screen place-items-center", className)}
      {...props}
    >
      <Loader className="h-8 w-8 text-primary" />
    </div>
  );
}

export { Loader, PageLoader };
