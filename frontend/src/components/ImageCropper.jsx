import { useEffect, useRef, useState } from 'react';
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import toast from 'react-hot-toast';

const ImageCropper = ({ imgSrc, aspectRatio, minWidth, circularCrop=false, handleCancel, handleDone }) => {
  const [crop, setCrop] = useState({});
  console.log(crop)

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const cropContainerRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) =>{
      if (!cropContainerRef.current.contains(e.target)){
        handleCancel();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  const onImageLoad = (e) =>{
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    const minHeight = minWidth / aspectRatio;
    const widthPercent = minWidth / width * 100;

    if (naturalWidth < minWidth || naturalHeight < minHeight){
      handleCancel();
      return toast.error(`Image must be atleast ${minWidth}x${Math.ceil(minHeight)} pixels`);
    }

    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: widthPercent,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    )

    setCrop(crop);
  }

  const onCropComplete = () =>{
    console.log(crop);
    if (!imgRef.current || !canvasRef.current) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pxCrop = convertToPixelCrop(crop, image.width, image.height);
    console.log("pxCrop", pxCrop);
    const cropX = pxCrop.x * scaleX;
    const cropY = pxCrop.y * scaleY;
    const cropWidth = pxCrop.width * scaleX;
    const cropHeight = pxCrop.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    canvas.toBlob((blob) => {
      console.log("blob", blob);
      const croppedImageUrl = URL.createObjectURL(blob);
      console.log(croppedImageUrl);
      handleDone(croppedImageUrl);
    }, "image/png");
  }
  

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 h-screen flex justify-center items-center bg-black/30 z-100 p-3"
    >
      <div 
        ref={cropContainerRef} 
        className='w-full max-w-3xl p-4 relative py-3 px-4 bg-white rounded-lg shadow-lg z-50'
      >
        <div className='header'>
          <h2 className='text-lg sm:text-2xl font-semibold'>Customize picture</h2>

          <div className="w-full h-px bg-gray-300 mt-2 mb-4"></div>
        </div>

        <div className='flex justify-center items-center'>
          <div className='min-h-5 max-h-[calc(100vh-250px)] overflow-auto px-2'>
            <ReactCrop 
              crop={crop} 
              aspect={aspectRatio}
              circularCrop={circularCrop}
              keepSelection={true}
              onChange={(crop, percentCrop) => setCrop(percentCrop)}
              minWidth={minWidth}
            >
              <img className="max-w-full" ref={imgRef} src={imgSrc} onLoad={onImageLoad} />
            </ReactCrop>
          </div>
        </div>

        <canvas ref={canvasRef} className='hidden'></canvas>

        <div className="w-full h-px bg-gray-300 mt-4 mb-2.5"></div>

        <div className='flex justify-end'>
          <div>
            <button 
              onClick={handleCancel}
              className="py-1 px-4 bg-gray-200 font-semibold rounded-full cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={onCropComplete}
              className="py-1 px-4 bg-black text-white font-medium rounded-full ml-2 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ImageCropper;
