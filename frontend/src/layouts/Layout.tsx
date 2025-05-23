import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import React from "react";
import SearchBar from "../components/SearchBar";

interface Props {
  children: React.ReactNode;
  showSearch?: boolean;
}

const Layout = ({ children, showSearch = true }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      {showSearch && (
        <div className="container mx-auto">
          <SearchBar />
        </div>
      )}
      <div className="container mx-auto py-10 flex-1">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
