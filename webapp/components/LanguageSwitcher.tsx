'use client'
import {usePathname,useRouter} from 'next/navigation';
const locales=['it','en','fr','es','de'];
function replaceLocale(path:string,locale:string){const parts=path.split('/');if(parts[1]&&locales.includes(parts[1])){parts[1]=locale;return parts.join('/');}return `/${locale}${path.startsWith('/')?'':'/'}${path}`;}
export default function LanguageSwitcher(){const router=useRouter();const pathname=usePathname();return(<select aria-label="Language" defaultValue={pathname.split('/')[1]} onChange={(e)=>router.push(replaceLocale(pathname,e.target.value))} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #e6e8ef'}}><option value="it">IT</option><option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option><option value="de">DE</option></select>);}
