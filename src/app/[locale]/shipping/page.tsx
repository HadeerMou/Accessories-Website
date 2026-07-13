import HelpLayout from '@/components/HelpLayout';

export default function ShippingPage() {
  return (
    <HelpLayout title="Shipping">
      <p>We offer global shipping to ensure our pieces reach you wherever you are.</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">Domestic Shipping</h3>
      <p>Standard domestic shipping takes 3-5 business days. Express options are available at checkout.</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">International Shipping</h3>
      <p>International orders usually take 7-14 business days. Please note that customs duties and taxes are the responsibility of the recipient.</p>
    </HelpLayout>
  );
}
