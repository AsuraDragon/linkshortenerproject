import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { ArrowUpRight, Calendar, Globe, Link2, Layers, Sparkles } from "lucide-react";
import { db } from "@/db";
import { links } from "@/db/schema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { CreateLinkDialog } from "@/components/create-link-dialog";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Next.js 16 async headers API
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;

  // Mandatory tenant-isolated query ordered latest to oldest by updated at date
  const userLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.updatedAt));

  const latestLink = userLinks[0];
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold">
              {userLinks.length} {userLinks.length === 1 ? "Link" : "Links"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your shortened URLs, copy branded links, and inspect destinations.
          </p>
        </div>
        <div>
          <CreateLinkDialog />
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Links
            </CardTitle>
            <Layers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {userLinks.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All shortened URLs linked to your account
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Status
            </CardTitle>
            <Sparkles className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {userLinks.length} Active
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              100% of links ready to route
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Last Updated
            </CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {latestLink
                ? dateFormatter.format(new Date(latestLink.updatedAt))
                : "None yet"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {latestLink ? `/${latestLink.code}` : "Create your first link"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Links List / Table */}
      {userLinks.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Link2 className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No links found</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            You have not created any short links yet. Get started by shortening your first URL.
          </p>
          <div className="mt-5">
            <CreateLinkDialog
              triggerText="Shorten your first link"
              triggerSize="default"
            />
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base font-semibold text-foreground">
              Your Shortened Links
            </CardTitle>
            <CardDescription>
              All links created under your verified tenant account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Short Link</TableHead>
                  <TableHead>Original Destination</TableHead>
                  <TableHead className="w-[160px]">Last Updated</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userLinks.map((link) => {
                  const fullShortUrl = `${baseUrl}/${link.code}`;
                  return (
                    <TableRow key={link.id} className="group">
                      {/* Short Link Code */}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs tracking-tight text-foreground"
                          >
                            /{link.code}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Destination URL */}
                      <TableCell>
                        <div className="flex max-w-md items-center gap-2">
                          <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                          <span
                            className="truncate text-xs font-mono text-muted-foreground transition-colors group-hover:text-foreground"
                            title={link.url}
                          >
                            {link.url}
                          </span>
                        </div>
                      </TableCell>

                      {/* Updated Date */}
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>{dateFormatter.format(new Date(link.updatedAt))}</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <CopyButton text={fullShortUrl} />
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={-1}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              aria-label={`Open destination URL for ${link.code}`}
                            >
                              <ArrowUpRight className="size-4" />
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
