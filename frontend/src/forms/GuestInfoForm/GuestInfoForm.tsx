import DatePicker from "react-datepicker";
import { UseSearchContext } from "../../contexts/SearchContext";
import { UseAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { HotelType } from "../../../../backend/src/shared/types";

type Props = {
  hotelId: string;
  selectedRoom: HotelType["roomTypes"][0] | null;
  checkIn: Date | null;
  setCheckIn: (date: Date | null) => void;
  checkOut: Date | null;
  setCheckOut: (date: Date | null) => void;
  adultCount: number;
  setAdultCount: (count: number) => void;
  childCount: number;
  setChildCount: (count: number) => void;
};

const GuestInfoForm = ({
  hotelId,
  selectedRoom,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  adultCount,
  setAdultCount,
  childCount,
  setChildCount,
}: Props) => {
  const search = UseSearchContext();
  const { isLoggedIn } = UseAppContext();
  const navigate = useNavigate();

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

  const totalCost = selectedRoom ? nights * selectedRoom.price : 0;

  const handleSubmit = () => {
    if (!checkIn || !checkOut || !selectedRoom) return;

    const nights = calculateNights(checkIn, checkOut);
    const totalCost = nights * selectedRoom.price;

    search.saveSearchValues("", checkIn, checkOut, adultCount, childCount);

    navigate(`/hotel/${hotelId}/booking`, {
      state: {
        selectedRoom: {
          name: selectedRoom.name,
          price: selectedRoom.price,
        },
        totalCost,
        checkIn,
        checkOut,
        adultCount,
        childCount,
        nights,
      },
    });
  };

  const handleSignInRedirect = () => {
    if (!checkIn || !checkOut) return;

    search.saveSearchValues("", checkIn, checkOut, adultCount, childCount);

    navigate(`/sign-in?redirectTo=/detail/${hotelId}`, {
      state: {
        fromHotelId: hotelId,
      },
    });
  };

  return (
    <div className="flex flex-col p-4 bg-blue-200 gap-4 sticky top-4 self-start">
      <h3 className="text-md font-bold">
        {selectedRoom ? (
          <>
            {selectedRoom.name}
            {nights > 0 && ` – Total: $${totalCost}`}
          </>
        ) : (
          <span className="text-sm text-red-600 font-medium">
            Nu există camere disponibile. Te rugăm să modifici datele sau
            numărul de oaspeți.
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 gap-4 items-center">
        <div>
          <DatePicker
            required
            selected={checkIn}
            onChange={(date) => setCheckIn(date as Date)}
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
            onChange={(date) => setCheckOut(date as Date)}
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
              value={adultCount}
              onChange={(e) => setAdultCount(parseInt(e.target.value))}
              required
            />
          </label>
          <label className="items-center flex">
            Children:
            <input
              className="w-full p-1 focus:outline-none font-bold"
              type="number"
              min={0}
              max={20}
              value={childCount}
              onChange={(e) => setChildCount(parseInt(e.target.value))}
            />
          </label>
        </div>
        <button
          onClick={isLoggedIn ? handleSubmit : handleSignInRedirect}
          disabled={!selectedRoom}
          className={`${
            selectedRoom ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-400"
          } text-white h-full p-2 font-bold text-xl transition-colors`}
        >
          {isLoggedIn ? "Book Now" : "Sign in to Book"}
        </button>
      </div>
    </div>
  );
};

export default GuestInfoForm;
