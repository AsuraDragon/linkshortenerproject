import { auth } from "@clerk/nextjs/server";
import { Show, SignUpButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="max-w-2xl space-y-6">
        <Badge variant="secondary" className="uppercase tracking-[0.18em]">
          Smart URL links
        </Badge>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Shorten links, grow reach, and keep your branded flow simple.
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          Create clean short links and manage them from a polished dashboard with a secure Clerk-powered sign-in flow.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Show when="signed-out">
          <SignUpButton mode="modal">
            <Button size="lg">
              Create your first account
            </Button>
          </SignUpButton>
        </Show>
        <Badge variant="outline" className="h-auto py-1 px-3 text-sm font-normal text-muted-foreground">
          {"Your first sign-in and sign-up controls are visible here."}
        </Badge>
      </div>
    </div>
  );
}


