import { FormProvider, useForm } from "react-hook-form";
import DetailsSection from "./DetailsSection";
import TypeSection from "./TypeSection";
import FacilitiesSection from "./FacilitiesSection";
import ImagesSection from "./ImagesSection";
import { HotelType } from "../../../../backend/src/shared/types";
import { useEffect } from "react";
import RoomTypesSection from "./RoomsTypesSection";

export type HotelFormData = {
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  pricePerNight: number;
  starRating: number;
  facilities: string[];
  imageFiles: File[];
  imageUrls: string[];
  adultCount: number;
  childCount: number;
  location: {
    lat: number;
    lng: number;
  };
  roomTypes: {
    name: string;
    price: number;
    adults: number;
    children: number;
    totalRooms: number;
  }[];
};

type Props = {
  hotel?: HotelType;
  onSave: (hotelFormData: FormData) => void;
  isLoading: boolean;
};

const ManageHotelForm = ({ onSave, isLoading, hotel }: Props) => {
  const formMethods = useForm<HotelFormData>();
  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    reset(hotel);
  }, [hotel, reset]);

  const onSubmit = handleSubmit((formDataJson: HotelFormData) => {
    const formData = new FormData();
    if (hotel) {
      formData.append("hotelId", hotel._id);
    }
    formData.append("name", formDataJson.name);
    formData.append("city", formDataJson.city);
    formData.append("country", formDataJson.country);
    formData.append("description", formDataJson.description);
    formData.append("type", formDataJson.type);
    formData.append("starRating", formDataJson.starRating.toString());
    formData.append("location.lat", formDataJson.location.lat.toString());
    formData.append("location.lng", formDataJson.location.lng.toString());

    formDataJson.facilities.forEach((facility, index) => {
      formData.append(`facilities[${index}]`, facility);
    });

    formDataJson.roomTypes.forEach((room, index) => {
      formData.append(`roomTypes[${index}][name]`, room.name);
      formData.append(`roomTypes[${index}][price]`, room.price.toString());
      formData.append(`roomTypes[${index}][adults]`, room.adults.toString());
      formData.append(
        `roomTypes[${index}][children]`,
        room.children.toString()
      );
      formData.append(
        `roomTypes[${index}][totalRooms]`,
        room.totalRooms.toString()
      );
    });

    console.log("Submitting roomTypes:", formDataJson.roomTypes);

    if (formDataJson.imageUrls) {
      formDataJson.imageUrls.forEach((url, index) => {
        formData.append(`imageUrls[${index}]`, url);
      });
    }

    Array.from(formDataJson.imageFiles).forEach((imageFile) => {
      formData.append(`imageFiles`, imageFile);
    });

    onSave(formData);
  });

  return (
    <FormProvider {...formMethods}>
      <form className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12 flex flex-col gap-10">
        <DetailsSection />
        <TypeSection />
        <FacilitiesSection />
        <RoomTypesSection />
        <ImagesSection />
        <span className="flex justify-end">
          <button
            disabled={isLoading}
            onClick={onSubmit}
            type="submit"
            className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl disabled:bg-gray-500"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </span>
      </form>
    </FormProvider>
  );
};

export default ManageHotelForm;
