import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { DataCard } from "@/components/ui/data-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  getConsultationsForUser,
  getOrganizationForUser,
  getProductAccessForOrganization,
} from "@/lib/db/queries";
import type { ConsultationStatus, ProductAccessStatus } from "@/lib/db/schema";
import { getAllProducts } from "@/data/products";
import { formatDate } from "@/lib/format-date";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const productAccessLabels: Record<ProductAccessStatus, string> = {
  requested: "Requested",
  active: "Active",
  suspended: "Suspended",
};

const productAccessTones: Record<ProductAccessStatus, StatusTone> = {
  requested: "warning",
  active: "positive",
  suspended: "danger",
};

const consultationLabels: Record<ConsultationStatus, string> = {
  pending: "Pending",
  reviewing: "Reviewing",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const consultationTones: Record<ConsultationStatus, StatusTone> = {
  pending: "neutral",
  reviewing: "warning",
  approved: "positive",
  rejected: "danger",
  completed: "positive",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const organization = await getOrganizationForUser(session.user.id);
  const [access, consultations] = await Promise.all([
    organization ? getProductAccessForOrganization(organization.id) : Promise.resolve([]),
    getConsultationsForUser(session.user.id, organization?.id ?? null),
  ]);

  const accessBySlug = new Map<string, (typeof access)[number]>(
    access.map((row) => [row.productSlug, row])
  );

  return (
    <Container className="flex flex-col gap-10 py-10 md:py-14">
      <DashboardNav userName={session.user.name} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Welcome back, {session.user.name}
        </h1>
      </div>

      <DataCard title="Your products">
        <div className="flex flex-col divide-y divide-border">
          {getAllProducts().map((product) => {
            const row = accessBySlug.get(product.slug);
            const status: ProductAccessStatus | "not-requested" = row?.status ?? "not-requested";
            return (
              <div
                key={product.slug}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">{product.name}</span>
                  <span className="text-xs text-muted-strong">{product.tagline}</span>
                </div>
                {status === "not-requested" ? (
                  <StatusBadge label="Not requested" tone="neutral" />
                ) : (
                  <StatusBadge
                    label={productAccessLabels[status]}
                    tone={productAccessTones[status]}
                  />
                )}
              </div>
            );
          })}
        </div>
      </DataCard>

      <DataCard title="Consultations" action={<Button href="/contact" size="sm">New request</Button>}>
        {consultations.length === 0 ? (
          <EmptyState message="You haven't submitted a consultation request yet." />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {consultation.project.length > 80
                      ? `${consultation.project.slice(0, 80)}…`
                      : consultation.project}
                  </span>
                  <span className="text-xs text-muted-strong">
                    Submitted {formatDate(consultation.createdAt.toISOString())}
                  </span>
                </div>
                <StatusBadge
                  label={consultationLabels[consultation.status]}
                  tone={consultationTones[consultation.status]}
                />
              </div>
            ))}
          </div>
        )}
      </DataCard>
    </Container>
  );
}
