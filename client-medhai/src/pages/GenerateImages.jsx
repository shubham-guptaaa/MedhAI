import { Edit, Hash, Image, Sparkles } from "lucide-react";
import { useState } from "react";

const GenerateImage = () => {
  const imageStyle = [
    "realistic",
    "Ghibli Style",
    "Anime Style",
    "Cartoon Style",
    "Fantasy Style",
    "Cyberpunk Style",
    "Surreal Style",
    "Minimalist Style",
    "3D Style",
    "Potrait Style",
    "Abstract Style",
    "Vintage Style",
  ];

  const [selectStyle, setSelectStyle] = useState("General");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    //  generation logic can go here
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-300"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Describe Your Image</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input} rows={4}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="Decscribe your image here..."
          required
        />
        <p className="mt-4 text-sm font-medium">Style</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {imageStyle.map((item) => (
            <span
              onClick={() => setSelectStyle(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectStyle === item
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 border-gray-300"
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="my-6 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={publish}
              onChange={(e ) => setPublish(e.target.checked)}
            />
            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-blue-600 transition"> </div>
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <p className="text-sm"> Make this image public</p>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          <Image className="w-5" />
          Generate Image
        </button>
      </form>

      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-300 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-[#4a7AFF]" />
          <h1 className="text-xl font-semibold">Generated Image</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
            <Hash className="w-9 h-9 text-[#4a7AFF]" />
            <p>Enter a topic and click "Generate title" to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateImage;
