export const imgToFile = async (imgUrl, fileName = 'image.jpeg') =>{
  if (!imgUrl) return null;

  const response = await fetch(imgUrl);
  console.log("response", response);
  const blob = await response.blob();
  console.log("this is blob", blob);

  const file = new File([blob], fileName, { type:  "image/jpeg"});
  console.log("this is file", file);
  return file;
}