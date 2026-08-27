import { Logo } from "@/components/layout/logo";
import { logout } from "@/app/dashboard/actions";

export function DashboardNav({ userName }: { userName: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-6">
      <Logo />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-strong">{userName}</span>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-muted-strong transition-colors hover:text-foreground"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
