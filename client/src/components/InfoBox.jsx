export default function InfoBox({ children }) {
  return (
    <p className="text-xs text-gray-500 mb-4 flex gap-1.5 items-start">
      <span className="shrink-0 text-indigo-600 font-semibold">i</span>
      <span>{children}</span>
    </p>
  );
}
