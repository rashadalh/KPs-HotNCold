import { Face } from "./components/face";
import { Header } from "./components/header";
import { LocationList } from "./components/HeatOptions";
import { Toaster } from "./components/ui/sonner";
import Providers from "./Providers";

function App() {
  return (
    <Providers>
      <Header />
      <div className="flex justify-center pt-4">
        <div className="w-[800px]">
          <LocationList />
        </div>
      </div>
      <Face />
      <Toaster position="top-right" className="mt-10 bg-gray-600" />
    </Providers>
  );
}

export default App;
