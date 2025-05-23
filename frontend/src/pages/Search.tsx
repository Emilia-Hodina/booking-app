import { useQuery } from "@tanstack/react-query";
import { UseSearchContext } from "../contexts/SearchContext";
import * as apiClient from "../api-client";
import { useState, useRef, useEffect } from "react";
import SearchResultsCard from "../components/SearchResultsCard";
import Pagination from "../components/Pagination";
import StarRatingFilter from "../components/StarRatingFilter";
import HotelTypesFilter from "../components/HotelTypesFilter";
import FacilitiesFilter from "../components/FacilitiesFilter";
import PriceFilter from "../components/PriceFilter";
import SearchMap from "../components/SearchMap";

const Search = () => {
  const search = UseSearchContext();
  const [page, setPage] = useState<number>(1);
  const [selectedStars, setSelectedStars] = useState<string[]>([]);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
  const [sortOption, setSortOption] = useState<string>("");

  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Reset page to 1 on core search changes
  useEffect(() => {
    setPage(1);
  }, [
    search.destination,
    search.checkIn,
    search.checkOut,
    search.adultCount,
    search.childCount,
  ]);

  // Scroll to top of results section when page or filters change
  useEffect(() => {
    if (resultsSectionRef.current) {
      resultsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    page,
    selectedStars,
    selectedHotelTypes,
    selectedFacilities,
    selectedPrice,
    sortOption,
  ]);

  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
    stars: selectedStars,
    types: selectedHotelTypes,
    facilities: selectedFacilities,
    maxPrice: selectedPrice?.toString(),
    sortOption,
  };

  const { data: hotelData } = useQuery({
    queryKey: ["searchHotels", searchParams],
    queryFn: () => apiClient.searchHotels(searchParams),
  });

  const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const starRating = event.target.value;
    setSelectedStars((prevStars) =>
      event.target.checked
        ? [...prevStars, starRating]
        : prevStars.filter((star) => star !== starRating)
    );
    setPage(1);
  };

  const handleHotelTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hotelType = event.target.value;
    setSelectedHotelTypes((prevHotelTypes) =>
      event.target.checked
        ? [...prevHotelTypes, hotelType]
        : prevHotelTypes.filter((hotel) => hotel !== hotelType)
    );
    setPage(1);
  };

  const handleFacilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const facility = event.target.value;
    setSelectedFacilities((prevFacilities) =>
      event.target.checked
        ? [...prevFacilities, facility]
        : prevFacilities.filter((prevFacility) => prevFacility !== facility)
    );
    setPage(1);
  };

  const handlePriceChange = (value?: number) => {
    setSelectedPrice(value);
    setPage(1);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
    setPage(1);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
      {/* 👇 Move scroll anchor HERE for perfect alignment */}
      <div ref={resultsSectionRef} className="pt-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
        {/* Sidebar Filters */}
        <div className="rounded-lg border border-slate-300 p-5 h-fit lg:sticky top-10 md:mb-5 lg:mb-0">
          <div className="space-y-5">
            <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
              Filter by:
            </h3>
            <StarRatingFilter
              selectedStars={selectedStars}
              onChange={handleStarsChange}
            />
            <HotelTypesFilter
              selectedHotelTypes={selectedHotelTypes}
              onChange={handleHotelTypeChange}
            />
            <FacilitiesFilter
              selectedFacilities={selectedFacilities}
              onChange={handleFacilityChange}
            />
            <PriceFilter
              selectedPrice={selectedPrice}
              onChange={handlePriceChange}
            />
          </div>
        </div>

        {/* Hotel Results */}
        <div className="flex flex-col gap-5">
          {hotelData && hotelData.data.length > 0 && (
            <SearchMap hotels={hotelData.data} />
          )}

          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">
              {hotelData?.pagination.total} Hotels found
              {search.destination ? ` in ${search.destination}` : ""}
            </span>
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="p-2 border rounded-md"
            >
              <option value="">Sort By</option>
              <option value="starRating">Star Rating</option>
              <option value="pricePerNightAsc">
                Price Per Night (low to high)
              </option>
              <option value="pricePerNightDesc">
                Price Per Night (high to low)
              </option>
            </select>
          </div>

          {/* Hotel Cards */}
          <div className="flex flex-col gap-5">
            {hotelData?.data.map((hotel) => (
              <SearchResultsCard key={hotel._id} hotel={hotel} />
            ))}
          </div>

          {/* Pagination */}
          <div>
            <Pagination
              page={hotelData?.pagination.page || 1}
              pages={hotelData?.pagination.pages || 1}
              onPageChange={(newPage) => {
                setPage(newPage);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
