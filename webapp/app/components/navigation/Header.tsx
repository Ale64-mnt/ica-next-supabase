import { DesktopHeader } from './DesktopHeader';

type HeaderProps = { locale: string };

export function Header({ locale }: HeaderProps) {
  return <DesktopHeader locale={locale} />;
}