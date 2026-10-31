// Free / Pro tag next to a style name (icon browser, detail dialog).
import { Badge } from '@/components/ui/badge';

export function TierBadge({ pro, className }) {
  return (
    <Badge variant="secondary" className={`h-[18px] px-1.5 font-['General_Sans','Inter_Tight',sans-serif] text-[9.5px] font-semibold tracking-[0.06em] uppercase ${pro ? 'bg-[#eff6ff] text-[#1d4ed8]' : 'bg-[#ecfdf3] text-[#067647]'} ${className || ''}`}>
      {pro ? 'Pro' : 'Free'}
    </Badge>
  );
}
