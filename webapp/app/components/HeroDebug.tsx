'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = { src: string; alt: string };

export default function HeroDebug({ src, alt }: Props) {
  const [probe, setProbe] = useState<'pending' | 'ok' | 'fail'>('pending');
  const [errImg, setErrImg] = useState(false);
  const [errNext, setErrNext] = useState(false);

  useEffect(() => {
    setProbe('pending');
    fetch(src, { method: 'HEAD', cache: 'no-store' })
      .then(r => setProbe(r.ok ? 'ok' : 'fail'))
      .catch(() => setProbe('fail'));
  }, [src]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start border-2 border-amber-500 rounded-lg p-4 bg-yellow-50">
      <div className="space-y-3">
        <h2 className="font-bold">Hero Debug</h2>
        <ul className="text-sm leading-6">
          <li><b>src:</b> <code>{src}</code></li>
          <li><b>HEAD:</b> {probe}</li>
          <li><b>raw &lt;img&gt; error:</b> {errImg ? 'yes' : 'no'}</li>
          <li><b>next/image error (onLoadingComplete non chiamato):</b> {errNext ? 'yes' : 'no'}</li>
        </ul>

        <p className="text-sm">Tailwind check (box blu deve essere visibile):</p>
        <div className="w-6 h-6 bg-blue-500 rounded" />

        <p className="text-sm mt-3">Raw &lt;img&gt; (deve apparire se il file esiste):</p>
        <div className="relative w-full max-w-[640px] h-64 border border-red-400 bg-white rounded">
          <img
            src={src}
            alt={alt}
            style={{ objectFit: 'contain', width: '100%', height: '100%', display: 'block' }}
            onError={() => setErrImg(true)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm">next/image (stesso file, contenitore con altezza fissa):</p>
        <div className="relative w-full max-w-[640px] h-64 border border-blue-400 bg-white rounded">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 640px"
            priority
            onError={() => setErrNext(true)}
          />
        </div>
      </div>
    </div>
  );
}
