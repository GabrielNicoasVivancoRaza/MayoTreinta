import { useAuth } from '../context/AuthContext.jsx';

export default function ServerWakingBanner() {
  const { serverWaking } = useAuth();
  if (!serverWaking) return null;

  return (
    <div className="w-full bg-amber-100 text-amber-800 text-sm text-center py-2 px-4">
      Despertando servidor, puede tardar unos segundos...
    </div>
  );
}
