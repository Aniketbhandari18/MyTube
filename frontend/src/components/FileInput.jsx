import { Pencil } from "lucide-react";
import { useRef } from "react";

const FileInput = ({ setImgSrc }) => {
  const inputRef = useRef(null);

  const clearInput = (e) =>{
    e.target.value = "";
  }

  const handleOnChange = (e) =>{
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () =>{
      setImgSrc(reader.result);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={handleOnChange}
        onClick={clearInput}
      />

      <button
        type="button"
        onClick={() => inputRef.current.click()}
        className="bg-black text-white p-2 rounded-full cursor-pointer border border-gray-400 hover:shadow-blue-100 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] duration-200 hover:scale-110 active:scale-95"
      >
        <Pencil className="size-3 sm:size-4" />
      </button>

      
    </div>
  )
}
export default FileInput;