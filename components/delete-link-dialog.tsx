"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
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
import { deleteLinkAction } from "@/app/dashboard/actions";

interface DeleteLinkDialogProps {
  link: Link;
}

export function DeleteLinkDialog({ link }: DeleteLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
    }
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteLinkAction(link.id);
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
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label={`Delete ${link.code}`}
          />
        }
      >
        <Trash2 className="size-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                <AlertTriangle className="size-4" />
              </div>
              <DialogTitle>Delete Short Link?</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-left">
              Are you sure you want to permanently delete{" "}
              <span className="font-mono font-medium text-foreground">
                /{link.code}
              </span>
              ? Visitors visiting this short URL will no longer be redirected to{" "}
              <span className="font-mono text-xs text-foreground underline break-all">
                {link.url}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

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
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleDelete}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  <span>Delete Link</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
