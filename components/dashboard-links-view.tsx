"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  Globe,
  LayoutGrid,
  Rows3,
  StretchHorizontal,
} from "lucide-react";
import type { Link } from "@/db/schema";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { EditLinkDialog } from "@/components/edit-link-dialog";
import { DeleteLinkDialog } from "@/components/delete-link-dialog";

export type ViewMode = "compact" | "wide" | "grid";

interface DashboardLinksViewProps {
  links: Link[];
  baseUrl: string;
  initialView?: ViewMode;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function DashboardLinksView({
  links,
  baseUrl,
  initialView = "compact",
}: DashboardLinksViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  const handleViewChange = (val: string) => {
    const mode = val as ViewMode;
    setViewMode(mode);
    try {
      document.cookie = `dashboard_view_mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      {/* View Switcher Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Your Shortened Links
          </h2>
          <p className="text-xs text-muted-foreground">
            Showing {links.length} {links.length === 1 ? "link" : "links"} in your tenant
          </p>
        </div>

        <Tabs value={viewMode} onValueChange={handleViewChange}>
          <TabsList className="bg-muted/80 p-1">
            <TabsTrigger value="compact" className="gap-1.5 px-2.5 py-1 text-xs">
              <Rows3 className="size-3.5" />
              <span>Compact</span>
            </TabsTrigger>
            <TabsTrigger value="wide" className="gap-1.5 px-2.5 py-1 text-xs">
              <StretchHorizontal className="size-3.5" />
              <span>Wide</span>
            </TabsTrigger>
            <TabsTrigger value="grid" className="gap-1.5 px-2.5 py-1 text-xs">
              <LayoutGrid className="size-3.5" />
              <span>Grid</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 1. COMPACT VIEW (Table layout with hover actions) */}
      {viewMode === "compact" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Short Link</TableHead>
                  <TableHead>Original Destination</TableHead>
                  <TableHead className="w-[150px]">Last Updated</TableHead>
                  <TableHead className="w-[160px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => {
                  const fullShortUrl = `${baseUrl}/${link.code}`;
                  return (
                    <TableRow key={link.id} className="group transition-colors">
                      <TableCell className="font-medium">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs tracking-tight text-foreground"
                        >
                          /{link.code}
                        </Badge>
                      </TableCell>

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

                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>{dateFormatter.format(new Date(link.updatedAt))}</span>
                        </div>
                      </TableCell>

                      {/* Actions: Hidden by default, visible only on hover / focus */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
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
                          <EditLinkDialog link={link} />
                          <DeleteLinkDialog link={link} />
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

      {/* 2. WIDE VIEW (Larger horizontal cards) */}
      {viewMode === "wide" && (
        <div className="space-y-3">
          {links.map((link) => {
            const fullShortUrl = `${baseUrl}/${link.code}`;
            return (
              <Card
                key={link.id}
                className="group relative transition-all hover:border-primary/50 hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-start gap-3.5 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Globe className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs font-semibold"
                        >
                          /{link.code}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          Updated {dateFormatter.format(new Date(link.updatedAt))}
                        </span>
                      </div>

                      <p
                        className="truncate text-xs font-mono text-muted-foreground transition-colors group-hover:text-foreground"
                        title={link.url}
                      >
                        {link.url}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Hidden by default, visible only on hover / focus */}
                  <div className="flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 self-end sm:self-center">
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
                    <EditLinkDialog link={link} />
                    <DeleteLinkDialog link={link} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 3. GRID VIEW (Vertical cards) */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => {
            const fullShortUrl = `${baseUrl}/${link.code}`;
            return (
              <Card
                key={link.id}
                className="group relative flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs font-semibold"
                  >
                    /{link.code}
                  </Badge>

                  {/* Actions: Hidden by default, visible on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={-1}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        aria-label={`Open destination URL for ${link.code}`}
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Button>
                    </a>
                    <EditLinkDialog link={link} />
                    <DeleteLinkDialog link={link} />
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-2 pb-3">
                  <div className="flex items-start gap-2">
                    <Globe className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <p
                      className="line-clamp-2 text-xs font-mono text-muted-foreground break-all transition-colors group-hover:text-foreground"
                      title={link.url}
                    >
                      {link.url}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border/40 p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Calendar className="size-3" />
                    <span>{dateFormatter.format(new Date(link.updatedAt))}</span>
                  </div>
                  <CopyButton text={fullShortUrl} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
