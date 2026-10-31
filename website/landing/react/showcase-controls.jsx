// Showcase controls: which screen (Tabs) and which icon style (ToggleGroup). main.js owns the stage and
// the auto-advance; it renders this with the current values and gets the user's choices back.
import { STYLE_INFO } from '../shared/icons.js';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function ShowcaseControls({ tabs, tab, styles, style, onTab, onStyle }) {
  return (
    <>
      <Tabs value={String(tab)} onValueChange={(v) => onTab(+v)}>
        <TabsList variant="line" className="h-auto flex-wrap justify-start gap-2 p-0">
          {tabs.map((t, i) => (
            <TabsTrigger key={t.id} value={String(i)}
              className="h-[34px] flex-none rounded-full border-border! bg-background px-3.5 text-sm text-foreground after:hidden data-active:border-primary! data-active:bg-primary! data-active:text-primary-foreground!">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <ToggleGroup type="single" value={style} onValueChange={(v) => v && onStyle(v)} spacing={0} aria-label="Icon style" className="rounded-[10px] bg-muted p-[3px]">
        {styles.map((s) => (
          <ToggleGroupItem key={s} value={s} size="sm"
            className="rounded-[7px]! px-3 text-muted-foreground hover:bg-transparent data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
            {STYLE_INFO[s].label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </>
  );
}
