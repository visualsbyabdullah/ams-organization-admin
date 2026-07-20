import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  buttonVariants,
} from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  APPROVAL_INBOX_ITEMS,
} from "@/config/approvals";

export function ApprovalInbox() {
  const totalPending =
    APPROVAL_INBOX_ITEMS.reduce(
      (total, item) =>
        total + item.count,
      0,
    );

  return (
    <div className="mx-auto max-w-360">
      <PageHeader
        eyebrow="Operations"
        title="Approval inbox"
        description="Review operational requests and records waiting for administrator action."
      />

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-muted">
                Pending approvals
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight">
                {totalPending}
              </p>

              <p className="mt-2 text-xs text-text-muted">
                Across operational modules
              </p>
            </div>

            <span className="flex size-10 items-center justify-center rounded-control bg-warning-muted text-warning">
              <Clock3 />
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-muted">
                Approval queues
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight">
                {APPROVAL_INBOX_ITEMS.length}
              </p>

              <p className="mt-2 text-xs text-text-muted">
                Leave, attendance and payroll
              </p>
            </div>

            <span className="flex size-10 items-center justify-center rounded-control bg-info-muted text-info">
              <CheckCircle2 />
            </span>
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {APPROVAL_INBOX_ITEMS.map(
          (item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.id}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-control ${item.iconTone}`}
                    >
                      <Icon size={20} />
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-bold">
                          {item.title}
                        </h2>

                        <Badge
                          variant={
                            item.badgeVariant
                          }
                        >
                          {item.count}
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href={item.href}
                  className={`${buttonVariants({
                    variant: "outline",
                  })} mt-5 w-full`}
                >
                  Review queue
                  <ArrowRight size={17} />
                </Link>
              </Card>
            );
          },
        )}
      </section>
    </div>
  );
}