import { Sparkles } from "lucide-react";

export function DashboardLayoutSkeleton() {
  return (
    <div className="admin-brand-loading" role="status" aria-live="polite">
      <div className="admin-brand-loading__card">
        <span className="admin-brand-loading__icon"><Sparkles size={28} fill="currentColor" /></span>
        <p>HELLO, ADMIN HUMAN</p>
        <strong>MIND CHECK!<br />관리 화면을 준비 중이에요.</strong>
        <i /><i /><i />
      </div>
    </div>
  );
}
