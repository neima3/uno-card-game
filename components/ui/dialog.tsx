"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog");
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(open);
  const isOpen = onOpenChange ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: setIsOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useDialog();
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => onOpenChange(true),
    });
  }
  
  return (
    <button {...props} onClick={() => onOpenChange(true)}>
      {children}
    </button>
  );
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  const { open } = useDialog();
  
  if (!open) return null;
  
  return <>{children}</>;
}

function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { onOpenChange } = useDialog();
  
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in",
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { onOpenChange } = useDialog();
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/20 bg-gray-900/95 p-6 shadow-2xl duration-200 rounded-2xl animate-in fade-in zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-lg p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-xl font-bold text-white", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-white/70", className)} {...props} />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
