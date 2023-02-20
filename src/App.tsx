import React from "react";
import { Footer, Transaction, Services, Navbar, Wellcome } from "./components";

type Props = {};

const App = (props: Props) => {
  
  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <Navbar />
        <Wellcome />
      </div>
      <Services />
      <Transaction />
      <Footer />
    </div>
  );
};






export default App;
