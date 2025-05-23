import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { UseSearchContext } from "../../contexts/SearchContext";
import { UseAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { HotelType } from "../../../../backend/src/shared/types";

type Props = {
  hotelId: string;
  selectedRoom: HotelType["roomTypes"][0];
};

type GuestInfoFormData = {
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  roomTypeName: string;
};

const GuestInfoForm = ({ hotelId, selectedRoom }: Props) => {
  const search = UseSearchContext();
  const { isLoggedIn } = UseAppContext();
  const navigate = useNavigate();

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    defaultValues: {
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adultCount: search.adultCount,
      childCount: search.childCount,
      roomTypeName: selectedRoom.name,
    },
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const calculateNights = (start: Date, end: Date): number => {
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const nights =
    checkIn && checkOut && checkOut > checkIn
      ? calculateNights(checkIn, checkOut)
      : 0;
  const totalCost = nights * selectedRoom.price;

  const navigateWithBookingData = (
    data: GuestInfoFormData,
    redirectTo: string
  ) => {
    const nights = calculateNights(data.checkIn, data.checkOut);
    const totalCost = nights * selectedRoom.price;

    search.saveSearchValues(
      "",
      data.checkIn,
      data.checkOut,
      data.adultCount,
      data.childCount
    );

    navigate(redirectTo, {
      state: {
        selectedRoom: {
          name: selectedRoom.name,
          price: selectedRoom.price,
        },
        totalCost,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        adultCount: data.adultCount,
        childCount: data.childCount,
        nights,
      },
    });
  };

  const onSubmit = (data: GuestInfoFormData) =>
    navigateWithBookingData(data, `/hotel/${hotelId}/booking`);

  const onSignInClick = (data: GuestInfoFormData) =>
    navigateWithBookingData(data, "/sign-in");

  return (
    <div className="flex flex-col p-4 bg-blue-200 gap-4 sticky top-4 self-start">
      <h3 className="text-md font-bold">
        {selectedRoom.name}
        {nights > 0 && ` – Total: $${totalCost}`}
      </h3>

      <form
        onSubmit={
          isLoggedIn ? handleSubmit(onSubmit) : handleSubmit(onSignInClick)
        }
      >
        <div className="grid grid-cols-1 gap-4 items-center">
          <input type="hidden" {...register("roomTypeName")} />
          <div>
            <DatePicker
              required
              selected={checkIn}
              onChange={(date) => setValue("checkIn", date as Date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Check-in Date"
              className="min-w-full bg-white p-2 focus:outline-none"
              wrapperClassName="min-w-full"
            />
          </div>
          <div>
            <DatePicker
              required
              selected={checkOut}
              onChange={(date) => setValue("checkOut", date as Date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn || minDate}
              maxDate={maxDate}
              placeholderText="Check-out Date"
              className="min-w-full bg-white p-2 focus:outline-none"
              wrapperClassName="min-w-full"
            />
          </div>
          <div className="flex bg-white px-2 py-1 gap-2">
            <label className="items-center flex">
              Adults:
              <input
                className="w-full p-1 focus:outline-none font-bold"
                type="number"
                min={1}
                max={20}
                {...register("adultCount", {
                  required: "This field is required",
                  min: {
                    value: 1,
                    message: "There must be at least one adult",
                  },
                  valueAsNumber: true,
                })}
              />
            </label>
            <label className="items-center flex">
              Children:
              <input
                className="w-full p-1 focus:outline-none font-bold"
                type="number"
                min={0}
                max={20}
                {...register("childCount", {
                  valueAsNumber: true,
                })}
              />
            </label>
            {errors.adultCount && (
              <span className="text-red-500 font-semibold text-sm">
                {errors.adultCount.message}
              </span>
            )}
          </div>
          <button className="bg-blue-600 text-white h-full p-2 font-bold hover:bg-blue-500 text-xl">
            {isLoggedIn ? "Book Now" : "Sign in to Book"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestInfoForm;
