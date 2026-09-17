"use client";

import { useState, useTransition } from "react";
import { Plus, Link2, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLinkAction } from "@/app/dashboard/actions";

interface CreateLinkDialogProps {
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "secondary";
  triggerSize?: "default" | "sm" | "lg";
}

export function CreateLinkDialog({
  triggerText = "Create Link",
  triggerVariant = "default",
  triggerSize = "sm",
}: CreateLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createLinkAction(null, formData);
      if (!res.success) {
        setError(res.error);
      } else {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className="gap-2 font-medium shadow-sm"
          />
        }
      >
        <Plus className="size-4" />
        <span>{triggerText}</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Link2 className="size-4" />
              </div>
              <DialogTitle>Create Short Link</DialogTitle>
            </div>
            <DialogDescription>
              Enter a destination URL to generate a short, shareable link.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="url" className="text-xs font-semibold">
                Destination URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                name="url"
                type="text"
                placeholder="https://example.com/long-page-url"
                required
                disabled={isPending}
                autoComplete="off"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Any valid web address. If http/https is omitted, https will be added.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-semibold">
                Custom Back-half (optional)
              </Label>
              <div className="flex items-center rounded-lg border border-input bg-transparent px-2.5 dark:bg-input/30">
                <span className="text-xs font-mono text-muted-foreground select-none">
                  /
                </span>
                <input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="custom-slug"
                  maxLength={20}
                  disabled={isPending}
                  autoComplete="off"
                  className="h-8 w-full min-w-0 bg-transparent px-1.5 py-1 text-sm font-mono outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Up to 20 characters (letters, numbers, hyphens). Leave blank to auto-generate.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Create Link</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
