export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify handles escaping of quotes and slashes adequately for
      // script-tag embedding. We explicitly escape < to avoid breaking out of
      // the tag in the (unlikely) case a field contains "</script".
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
