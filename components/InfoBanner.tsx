export function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-800">
      {children}
    </div>
  );
}
