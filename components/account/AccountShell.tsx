/**
 * Marco común de /account: intro opcional (avatar + stats en Perfil).
 * Las pestañas viven en SiteHeader → AccountChrome (Instrucciones §5).
 */

type AccountShellProps = {
  intro?: React.ReactNode;
  children: React.ReactNode;
};

export function AccountShell({ intro, children }: AccountShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
      {intro}
      {children}
    </div>
  );
}
