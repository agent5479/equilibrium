/** Emit a JSON-LD script tag for search / AI crawlers. */
export default function JsonLd({ data }: { data: object | object[] }) {
  const payloads = Array.isArray(data) ? data : [data];
  return (
    <>
      {payloads.map((payload, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
        />
      ))}
    </>
  );
}
