import { Search } from "@/components/Search";

export default function Home() {
  return (
    <div className="p-4 pt-6 font-untitled-sans">
      <div className="text-2xl font-normal font-tiempos-headline">
        Socratica W24 Symposium Search
      </div>
      <div className="text-lg text-stone-600">Waterloo, ON, Canada</div>
      <Search />
    </div>
  );
}
