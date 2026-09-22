import React from "react";
import Header from "./components/Header";
// import Hero from "./components/Hero";
import About from "./components/About";
// import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col bg-brand-ink"
      style={{ paddingBottom: "var(--footer-h, 0px)" }}
    >
      <Header />
      <main className="flex-1">
        {/* <Hero />
        <Services /> */}
        <About />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
