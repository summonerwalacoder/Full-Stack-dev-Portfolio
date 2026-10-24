import type { Metadata } from "next";
import { FunnyThings } from "@/components/FunnyThings";
import { MatrixRain } from "@/components/MatrixRain";

export const metadata: Metadata = {
  title: "Funny Things",
  description:
    "Programming humor, developer life, student jokes, and other funny things.",
};

export default function FunnyPage() {
  return (
    <>
      <MatrixRain />
      <FunnyThings />
    </>
  );
}
