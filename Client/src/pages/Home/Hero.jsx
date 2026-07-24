import { MoveUpRight } from "lucide-react";
import React from "react";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="font-nohemi">
      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-12 px-6 py-20 lg:flex-row">
        {/* Left Content */}
        <div className="max-w-xl">
          <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
            AI Powered Exam Generator
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
            Design Perfect Question Papers Effortlessly
            <span className="text-blue-600">Seconds</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Stop spending hours formatting exam papers. Simply enter your
            questions, and watch them appear instantly in a professionally
            formatted question paper with a real-time preview. Fast, accurate,
            and ready to print.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              icon={<MoveUpRight size={20} strokeWidth={2} />}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <Link to="/work"> Try Now </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-10 flex gap-10">
            <div>
              <h3 className="text-2xl font-bold text-blue-600">10K+</h3>
              <p className="text-gray-500">Questions Generated</p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-blue-600">500+</h3>
              <p className="text-gray-500">Teachers</p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-blue-600">99%</h3>
              <p className="text-gray-500">Accuracy</p>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
          <div className="flex h-[420px] w-[420px] items-center justify-center rounded-3xl border border-blue-100 bg-white shadow-2xl">
            {/* Replace with your illustration */}
            <span className="text-xl font-semibold text-gray-400">
              Hero Image
            </span>

            {/* <img
              src="/hero.png"
              alt="AI Exam Generator"
              className="h-full w-full object-contain"
            /> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
