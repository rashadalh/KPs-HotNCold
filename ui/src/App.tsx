import { Face } from "./components/face";
import { Header } from "./components/header";
import { LocationList } from "./components/HeatOptions";
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
    </Providers>
  );
}

export default App;
