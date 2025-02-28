import { LoaderCircle } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <LoaderCircle className="size-9 animate-spin [animation-duration:.6s] mb-25" />
    </div>
  )
}
export default LoadingSpinner;