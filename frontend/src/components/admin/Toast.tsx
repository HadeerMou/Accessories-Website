type ToastProps = {
  message: string;
};

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[70] rounded-xl bg-[#1f2b25] px-5 py-3 text-sm text-white shadow-2xl">
      <span className="mr-2 text-[#d3b47b]">●</span>
      {message}
    </div>
  );
}
