export default function WelcomeScreen({ onStart }) {
  return (
    <div className="bg-[#DAB8F4] min-h-screen flex flex-col items-center justify-center px-8 select-none">
      <div className="flex flex-col items-center -mt-[40px]">
        {/* Greeting */}
        <p className="text-[24px] font-light text-black text-center leading-[1.5]">
          היי ליאן,
        </p>
        <p className="text-[24px] font-light text-black text-center leading-[1.5] mb-[36px]">
          מוכנה להתחיל לתרגל ?
        </p>

        {/* CTA button */}
        <button
          onClick={onStart}
          className="bg-black text-white text-[16px] font-medium rounded-[30px] px-[34px] py-[15px]"
        >
          יאללה, להתחיל
        </button>
      </div>
    </div>
  );
}
