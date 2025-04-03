import defaultUser from "../assets/defaultUser.png"
import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { Lock, User } from "lucide-react";
import Input from "../components/Input";
import toast from "react-hot-toast";
import FileInput from "../components/FileInput";
import ImageCropper from "../components/ImageCropper";
import { imgToFile } from "../utils/imgToFile";

const EditProfilePage = () => {
  const { isLoading, user, editProfile, editPassword } = useAuthStore();
  console.log(user);

  const descriptionRef = useRef(null);

  const [username, setUsername] = useState(user?.username);
  const [description, setDescription] = useState(user?.description);
  const [avatar, setAvatar] = useState(user?.avatar);
  const [coverImage, setCoverImage] = useState(user?.coverImage);

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  useEffect(() =>{
    descriptionRef.current.style.height = "auto";
    descriptionRef.current.style.height = descriptionRef.current.scrollHeight + "px";
  }, [description])

  const handleDesciprtionChange = (e) =>{
    setDescription(e.target.value);
  }

  const handleEditProfile = async (e) =>{
    e.preventDefault();

    const formData = new FormData();
    if (username.trim() !== user?.username) formData.append("username", username);
    if (description.trim() !== user?.description) formData.append("description", description);
    if (avatar !== user?.avatar) formData.append("avatar", await imgToFile(avatar));
    if (coverImage !== user?.coverImage) formData.append("cover-image", await imgToFile(coverImage));

    console.log("formData", formData);

    await editProfile(formData);
    setSelectedAvatar(null);
    setSelectedCoverImage(null);
  }

  const handlePasswordChange = async (e) =>{
    e.preventDefault();

    if (newPassword !== confirmPassword){
      toast.error("New password and confirm password do not match");
      return;
    }

    await editPassword(oldPassword, newPassword);
  }
  const normalizeText = (text) => text?.replace(/\r\n/g, "\n") || "";

  const isSaveDisabled = !username.trim() || !description.trim() || (username.trim() === user?.username && normalizeText(description.trim()) === normalizeText(user?.description) && avatar === user?.avatar && coverImage === user?.coverImage);
  const isPasswordChangeDisabled = !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim();

  const handleCancel = (type) =>{
    if (type === "avatar") setSelectedAvatar(null);
    else if (type === "cover") setSelectedCoverImage(null);
  }

  const handleCropDone = (type, croppedImg) =>{
    if (type === "avatar"){
      setAvatar(croppedImg);
      setSelectedAvatar(null);
    }else if (type === "cover"){
      setCoverImage(croppedImg);
      setSelectedCoverImage(null);
    }
  }

  console.log("selectedAvatar", selectedAvatar);

  if (isLoading){
    return (
      <>
        <NavBar />
        <Sidebar />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pr-4 sm:pr-20 md:pr-37 pt-24 pl-8.5 xs:pl-20 sm:pl-38 md:pl-48 pb-6">
      <NavBar />
      <Sidebar />

      {selectedAvatar && (
        <ImageCropper 
          imgSrc={selectedAvatar}
          aspectRatio={1}
          minWidth={140}
          circularCrop={true}
          handleCancel={() => handleCancel("avatar")}
          handleDone={(croppedImg) => handleCropDone("avatar", croppedImg)}
        />
      )}

      {selectedCoverImage && (
        <ImageCropper 
          imgSrc={selectedCoverImage}
          aspectRatio={6.06}
          minWidth={500}
          handleCancel={() => handleCancel("cover")}
          handleDone ={(croppedImg) => handleCropDone("cover", croppedImg)}
        />
      )}

      <h2 className="text-2xl font-bold mb-3">Edit Profile</h2>

      <form onSubmit={handleEditProfile} className="mb-4">
        <div>
          <div className="relative cover-image rounded-xl overflow-hidden mb-4">
            {coverImage ? (
              <img 
                className="w-full aspect-[4/1] sm:aspect-[5/1] object-cover" 
                src={coverImage} 
              />
            ): (
              <img className="w-full" src={defaultUser} />
            )}

            <div className="absolute top-2 right-3">
              <FileInput setImgSrc={setSelectedCoverImage} />
            </div>
          </div>

          <div className="relative rounded-full w-20 sm:w-22 md:w-25">
            {avatar ? (
              <img className="rounded-full" src={avatar} />
            ): (
              <img className="bg-gray-300 rounded-full" src={defaultUser} />
            )}

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <FileInput setImgSrc={setSelectedAvatar} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="font-semibold">Username</p>
          <Input
            icon={User}
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <p className="font-semibold">Description</p>
          <textarea 
            ref={descriptionRef}
            className="w-full min-h-30 resize-none overflow-hidden py-1 px-2 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500 focus:ring-gray-500 placeholder-gray-500 placeholder:font-[500] font-semibold transition duration-200"
            placeholder="Tell viewers about your channel. your description will appear on about section of your channel."
            value={description}
            onChange={handleDesciprtionChange}
          />
        </div>

        <div className="w-full flex justify-end">
          <button
            disabled={isSaveDisabled}
            className={`bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer ${isSaveDisabled && "opacity-40"}`}
          >
            Save Changes
          </button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-3">Change Password</h2>

      <form onSubmit={handlePasswordChange}>
        <p className="font-semibold">Old Password</p>
        <Input
          icon={Lock}
          type="password"
          placeholder="Enter your old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <p className="font-semibold">New Password</p>
        <Input
          icon={Lock}
          type="password"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <p className="font-semibold">Confirm Password</p>
        <Input
          icon={Lock}
          type="text"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="w-full flex justify-end">
          <button
            disabled={isPasswordChangeDisabled}
            className={`bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer ${isPasswordChangeDisabled && "opacity-40"}`} 
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  )
}
export default EditProfilePage;