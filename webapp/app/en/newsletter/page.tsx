export const dynamic = 'force-static';
export default function NewsletterEn() {
  const action = process.env.NEXT_PUBLIC_NEWSLETTER_ACTION;
  return (
    <section className="mx-auto max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">Newsletter</h1>
      <p className="mb-6 text-gray-600">Subscribe to receive updates and guides.</p>
      <form action="https://3cc6c08f.sibforms.com/serve/MUIFAMDLVPLKw_k-e608HnSmipoVtLu5P8HUQQYKmcSIg43BMxVDvMRStjCrxnYFpNBLY_kc7N8hjSuze_A4mEHScc9cBkHxydgFNufsiAKGRBKEZJrwJx0tqFThl2sP9BAHhrrss6vhWOh0W2CSZ5OQpx6J_dulhA_HKwphlEZHOcbYl1ZLZcde8LlcgbDZkiZ7cEPDXR6wxeSv" action={action} method="POST" className="space-y-3">
        <input type="email" name="email" required placeholder="you@example.com"
               className="w-full rounded-xl border px-4 py-3" />
        <button className="rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white">Subscribe</button>
      </form>
      {!action && (<p className="mt-4 text-sm text-red-600">
        Set NEXT_PUBLIC_NEWSLETTER_ACTION to enable the form.
      </p>)}
    </section>
  );
}
