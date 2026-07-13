import HelpLayout from '@/components/HelpLayout';

export default function ReturnsPage() {
  return (
    <HelpLayout title="Returns & Exchanges">
      <p>We want you to love your Aura pieces. If you're not completely satisfied, we accept returns within 14 days of delivery.</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">Conditions</h3>
      <ul className="list-disc pl-5 space-y-2">
        <li>Items must be unworn and in their original packaging.</li>
        <li>Custom or engraved pieces are final sale.</li>
        <li>Earrings cannot be returned for hygiene reasons.</li>
      </ul>
    </HelpLayout>
  );
}
