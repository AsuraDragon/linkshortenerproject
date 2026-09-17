"use client";

import { useState, useTransition } from "react";
import { Pencil, Loader2, AlertCircle } from "lucide-react";
import type { Link } from "@/db/schema";
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
import { updateLinkAction } from "@/app/dashboard/actions";

interface EditLinkDialogProps {
  link: Link;
}

export function EditLinkDialog({ link }: EditLinkDialogProps) {
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
      const res = await updateLinkAction(null, formData);
      if (!res.success) {
        setError(res.error);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            aria-label={`Edit ${link.code}`}
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="id" value={link.id} />

          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pencil className="size-4" />
              </div>
              <DialogTitle>Edit Short Link</DialogTitle>
            </div>
            <DialogDescription>
              Update your destination URL or custom short code.
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
              <Label htmlFor={`edit-url-${link.id}`} className="text-xs font-semibold">
                Destination URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`edit-url-${link.id}`}
                name="url"
                type="text"
                defaultValue={link.url}
                placeholder="https://example.com/long-page-url"
                required
                disabled={isPending}
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`edit-code-${link.id}`} className="text-xs font-semibold">
                Custom Back-half <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center rounded-lg border border-input bg-transparent px-2.5 dark:bg-input/30">
                <span className="text-xs font-mono text-muted-foreground select-none">
                  /
                </span>
                <input
                  id={`edit-code-${link.id}`}
                  name="code"
                  type="text"
                  defaultValue={link.code}
                  maxLength={20}
                  required
                  disabled={isPending}
                  autoComplete="off"
                  className="h-8 w-full min-w-0 bg-transparent px-1.5 py-1 text-sm font-mono outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Up to 20 characters (letters, numbers, hyphens, and underscores).
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
