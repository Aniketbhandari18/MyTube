const Input = ({ icon: Icon, ...props }) => {
  return (
    <div className="relative mb-5">
      <div className="absolute left-0 pl-3 py-3 flex items-center pointer-events-none">
        <Icon className="size-5 text-gray-700" />
      </div>
      <input {...props}
        className="w-full pl-11 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500 focus:ring-gray-500 placeholder-gray-500 placeholder:font-[500] font-semibold
        transition duration-200"
      />
    </div>
  )
}
export default Input;