// Bento "React · Vue · HTML" tile: the same icon in three frameworks (shadcn Tabs), following the style
// picked in the showcase (main.js pushes it with update({ style })). Linear → the free packages,
// any other style → the Pro packages (installed from the Nodo Icons registry with a license key).
import { useState } from 'react';
import { STYLE_INFO } from '../shared/icons.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NdIcon } from '@/components/nd-icon';

// tiny syntax colouring, using the tile's own classes (.k keyword, .s string, .t tag, .a attribute)
const K = ({ children }) => <i className="k">{children}</i>;
const S = ({ children }) => <i className="s">{children}</i>;
const T = ({ children }) => <i className="t">{children}</i>;
const A = ({ children }) => <i className="a">{children}</i>;

export function CodeDemo({ style = 'duotone' }) {
  const [tab, setTab] = useState('react');
  const pro = style !== 'linear';
  const pkg = (fw) => (pro ? `@nodo-icons/${fw}-pro/${style}` : `@nodo-icons/${fw}`);
  const stroke = STYLE_INFO[style].paint === 'stroke';
  const code = {
    react: <><K>import</K> {'{ HomeIcon }'} <K>from</K> <S>'{pkg('react')}'</S>;{'\n\n'}<T>&lt;HomeIcon</T> <A>size</A>={'{24}'} <A>color</A>=<S>"currentColor"</S>{stroke && <> <A>strokeWidth</A>={`{${STYLE_INFO[style].strokeWidth}}`}</>} <A>title</A>=<S>"Home"</S> <T>/&gt;</T></>,
    vue: <><T>&lt;script</T> <A>setup</A><T>&gt;</T>{'\n'}<K>import</K> {'{ HomeIcon }'} <K>from</K> <S>'{pkg('vue')}'</S>;{'\n'}<T>&lt;/script&gt;</T>{'\n\n'}<T>&lt;HomeIcon</T> <A>:size</A>=<S>"24"</S> <A>color</A>=<S>"currentColor"</S> <A>title</A>=<S>"Home"</S> <T>/&gt;</T></>,
    html: <><T>&lt;svg</T> <A>width</A>=<S>"24"</S> <A>height</A>=<S>"24"</S> <A>role</A>=<S>"img"</S> <A>aria-label</A>=<S>"Home"</S><T>&gt;</T>{'\n  '}<T>&lt;use</T> <A>href</A>=<S>"sprite/{style}.svg#nd-home"</S> <T>/&gt;</T>{'\n'}<T>&lt;/svg&gt;</T></>,
  };
  return (
    <Tabs value={tab} onValueChange={setTab} className="code">
      <TabsList variant="line" className="code-tabs mono h-auto justify-start gap-1.5 p-0">
        {[['react', 'React'], ['vue', 'Vue'], ['html', 'HTML']].map(([k, l]) => (
          <TabsTrigger key={k} value={k}
            className="h-auto flex-none rounded-md px-2.5 py-[5px] font-mono text-[11px] font-normal tracking-[0.04em] text-zinc-500 uppercase after:hidden hover:text-zinc-300 data-active:bg-zinc-800! data-active:text-zinc-50!">
            {l}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.entries(code).map(([k, c]) => (
        <TabsContent key={k} value={k} className="mt-0"><pre><code>{c}</code></pre></TabsContent>
      ))}
      <div className="code-out">
        <NdIcon name="home" style={style} className="size-7" />
        <small className="mono">HomeIcon · {style} · 24{pro ? ' · Pro' : ' · free'}</small>
      </div>
    </Tabs>
  );
}
