import { X } from "lucide-react";

const AboutPopUp = ({ content, setIsExpanded }) => {
  return (
    <div className="fixed z-50 top-0 left-0 right-0 bottom-0 flex justify-center items-center h-screen bg-black/25">
      <div className="bg-gray-100 rounded-lg p-5 max-w-110 max-h-200 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-black">About</h2>
          <button className="cursor-pointer text-black" onClick={() => setIsExpanded(false)}>
            <X className="size-6" />
          </button>
        </div>

        <div className="whitespace-pre-line mb-3">{content}</div>
      </div>
    </div>
  )
}
export default AboutPopUp;